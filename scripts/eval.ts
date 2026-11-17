/**
 * Runs the 20 test questions through the real RAG pipeline and writes
 * eval/results.md (table) and eval/results.json.
 *
 * In-scope questions pass when an LLM judge agrees the answer matches the
 * expected facts. Citation of the expected document is reported separately.
 * Out-of-scope questions pass when the bot refuses ("I don't know...").
 *
 *   npm run eval
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import fs from "node:fs";
import path from "node:path";
import { answerQuestion } from "@/lib/rag/answer";
import { isRefusal } from "@/lib/rag/prompt";
import { generateJson } from "@/lib/gemini";
import { env } from "@/lib/env";

interface Q {
  id: number;
  question: string;
  expected?: string;
  doc?: string; // "A|B" = any of these substrings in a cited title
  outOfScope?: boolean;
}

async function judge(question: string, expected: string, answer: string): Promise<{ correct: boolean; reason: string }> {
  const out = await generateJson<{ correct?: boolean; reason?: string }>(
    'You grade a chatbot answer against a reference answer. It is correct if it states the key facts of the reference (numbers, dates, names, yes/no) without contradicting them. Extra correct detail is fine. Reply as JSON: {"correct": true|false, "reason": "<one short sentence>"}',
    `Question: ${question}\nReference: ${expected}\nChatbot answer: ${answer}`,
  );
  return { correct: Boolean(out.correct), reason: String(out.reason ?? "") };
}

const cell = (s: string) => s.replace(/\|/g, "\\|").replace(/\s+/g, " ").trim();

async function main() {
  const questions: Q[] = JSON.parse(fs.readFileSync(path.join("eval", "questions.json"), "utf8"));
  const results = [];

  for (const q of questions) {
    const { text, sources } = await answerQuestion(q.question);
    const refused = isRefusal(text);
    const citedTitles = [...new Set(sources.map((s) => (s.page ? `${s.title} p.${s.page}` : s.title)))];
    let pass: boolean;
    let cited: boolean | null = null;
    let reason: string;

    if (q.outOfScope) {
      pass = refused;
      reason = refused ? "Refused as expected" : "Answered instead of refusing";
    } else {
      const j = refused ? { correct: false, reason: "Refused an in-scope question" } : await judge(q.question, q.expected!, text);
      pass = j.correct;
      reason = j.reason;
      const wanted = (q.doc ?? "").toLowerCase().split("|");
      cited = sources.some((s) => wanted.some((w) => s.title.toLowerCase().includes(w)));
    }
    results.push({ ...q, answer: text, citedTitles, refused, pass, cited, reason });
    console.log(`${pass ? "PASS" : "FAIL"}  #${q.id} ${q.question}${cited === false ? "  (expected doc not cited)" : ""}`);
  }

  const inScope = results.filter((r) => !r.outOfScope);
  const outScope = results.filter((r) => r.outOfScope);
  const passed = results.filter((r) => r.pass).length;
  const summary = {
    model: env.chatModel(),
    embeddingModel: env.embeddingModel(),
    rerank: env.rerank(),
    date: new Date().toISOString().slice(0, 10),
    total: `${passed}/${results.length}`,
    inScope: `${inScope.filter((r) => r.pass).length}/${inScope.length}`,
    citedExpectedDoc: `${inScope.filter((r) => r.cited).length}/${inScope.length}`,
    refusedOutOfScope: `${outScope.filter((r) => r.pass).length}/${outScope.length}`,
  };

  const md = [
    "# DocuMind accuracy test",
    "",
    `Run on ${summary.date} with \`${summary.model}\`, embeddings \`${summary.embeddingModel}\`, re-ranking ${summary.rerank ? "on" : "off"}.`,
    "",
    `- **Overall: ${summary.total} correct**`,
    `- In-scope answered correctly: ${summary.inScope} (expected document cited: ${summary.citedExpectedDoc})`,
    `- Out-of-scope correctly refused: ${summary.refusedOutOfScope}`,
    "",
    "| # | Question | Expected | Bot answer | Sources cited | Result |",
    "|---|---|---|---|---|---|",
    ...results.map(
      (r) =>
        `| ${r.id} | ${cell(r.question)} | ${cell(r.outOfScope ? "Refuse (not in documents)" : r.expected!)} | ${cell(r.answer)} | ${cell(r.citedTitles.join("; ") || "–")} | ${r.pass ? "✅ Pass" : "❌ Fail"}${r.pass ? "" : `: ${cell(r.reason)}`} |`,
    ),
    "",
  ].join("\n");

  fs.writeFileSync(path.join("eval", "results.md"), md);
  fs.writeFileSync(path.join("eval", "results.json"), JSON.stringify({ summary, results }, null, 2));
  console.log("\n", summary, "\nWrote eval/results.md");
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
