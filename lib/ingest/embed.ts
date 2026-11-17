import { gemini } from "@/lib/gemini";
import { env } from "@/lib/env";

const BATCH = 100; // Gemini batch embedding limit per request

type TaskType = "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY";

/**
 * gemini-embedding-001 is trained with separate task types for stored passages
 * and search queries; using the right one noticeably improves retrieval.
 */
export async function embedMany(texts: string[], taskType: TaskType = "RETRIEVAL_DOCUMENT"): Promise<number[][]> {
  const out: number[][] = [];
  for (let i = 0; i < texts.length; i += BATCH) {
    const res = await gemini().models.embedContent({
      model: env.embeddingModel(),
      contents: texts.slice(i, i + BATCH),
      config: { taskType, outputDimensionality: env.embeddingDims },
    });
    for (const e of res.embeddings ?? []) {
      if (!e.values?.length) throw new Error("Gemini returned an empty embedding");
      out.push(e.values);
    }
  }
  if (out.length !== texts.length) throw new Error(`Expected ${texts.length} embeddings, got ${out.length}`);
  return out;
}

export async function embedQuery(text: string): Promise<number[]> {
  const [v] = await embedMany([text], "RETRIEVAL_QUERY");
  return v;
}
