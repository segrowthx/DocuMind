import { generateJson } from "@/lib/gemini";
import type { RetrievedChunk } from "./types";

const KEEP = 5;

/**
 * Optional LLM re-ranker (enable with RERANK=true). Scores each candidate
 * 0-10 for how well it answers the question and keeps the best few.
 * Falls back to vector order on any failure.
 */
export async function rerank(question: string, chunks: RetrievedChunk[]): Promise<RetrievedChunk[]> {
  if (chunks.length <= KEEP) return chunks;
  try {
    const list = chunks.map((c, i) => `#${i}: ${c.content.slice(0, 1200)}`).join("\n\n");
    const parsed = await generateJson<{ scores?: { i: number; s: number }[] }>(
      'Score how useful each passage is for answering the question, from 0 (irrelevant) to 10 (directly answers it). Reply as JSON: {"scores":[{"i":0,"s":7}]} with one entry per passage.',
      `Question: ${question}\n\nPassages:\n${list}`,
    );
    const score = new Map((parsed.scores ?? []).map((x) => [x.i, x.s]));
    return chunks
      .map((c, i) => ({ c, s: score.get(i) ?? 0 }))
      .sort((a, b) => b.s - a.s)
      .slice(0, KEEP)
      .map((x) => x.c);
  } catch {
    return chunks.slice(0, KEEP);
  }
}
