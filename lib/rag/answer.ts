import { gemini } from "@/lib/gemini";
import { env } from "@/lib/env";
import { retrieve } from "./retrieve";
import { buildPrompt, citedNumbers, REFUSAL, toSources, type GeminiPrompt } from "./prompt";
import type { ChatTurn, Source } from "./types";

export interface PreparedAnswer {
  sources: Source[];
  /** Null when nothing relevant was retrieved: answer with REFUSAL without calling the LLM. */
  prompt: GeminiPrompt | null;
}

export async function prepareAnswer(question: string, history: ChatTurn[]): Promise<PreparedAnswer> {
  const chunks = await retrieve(question, history);
  if (!chunks.length) return { sources: [], prompt: null };
  const { sources, context } = toSources(chunks);
  return { sources, prompt: buildPrompt(context, history, question) };
}

/** Streams answer text deltas. */
export async function* streamAnswer(prepared: PreparedAnswer): AsyncGenerator<string> {
  if (!prepared.prompt) {
    yield REFUSAL;
    return;
  }
  const stream = await gemini().models.generateContentStream({
    model: env.chatModel(),
    contents: prepared.prompt.contents,
    config: { systemInstruction: prepared.prompt.system, temperature: 0.1 },
  });
  for await (const chunk of stream) {
    const delta = chunk.text;
    if (delta) yield delta;
  }
}

/** Keep only the sources the answer cited. */
export function citedSources(answer: string, sources: Source[]): Source[] {
  const cited = new Set(citedNumbers(answer));
  return sources.filter((s) => cited.has(s.n));
}

/** Non-streaming helper (used by the eval script). */
export async function answerQuestion(question: string, history: ChatTurn[] = []) {
  const prepared = await prepareAnswer(question, history);
  let text = "";
  for await (const d of streamAnswer(prepared)) text += d;
  return { text, sources: citedSources(text, prepared.sources), retrieved: prepared.sources };
}
