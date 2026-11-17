import { supabaseAdmin } from "@/lib/supabase/admin";
import { embedQuery } from "@/lib/ingest/embed";
import { env } from "@/lib/env";
import { rerank } from "./rerank";
import type { ChatTurn, RetrievedChunk } from "./types";

export const TOP_K = 8;
export const MIN_SIMILARITY = 0.2;

/**
 * Short follow-ups ("and how much is it?") embed poorly on their own, so the
 * previous user question is folded into the search query.
 */
export function buildSearchQuery(question: string, history: ChatTurn[]): string {
  const prevUser = [...history].reverse().find((t) => t.role === "user")?.content;
  if (prevUser && question.split(/\s+/).length < 8) return `${prevUser}\n${question}`;
  return question;
}

export async function retrieve(question: string, history: ChatTurn[] = []): Promise<RetrievedChunk[]> {
  const query = buildSearchQuery(question, history);
  const embedding = await embedQuery(query);
  const { data, error } = await supabaseAdmin().rpc("match_chunks", {
    query_embedding: JSON.stringify(embedding),
    match_count: TOP_K,
    min_similarity: MIN_SIMILARITY,
  });
  if (error) throw new Error(`Retrieval failed: ${error.message}`);
  const chunks = (data ?? []) as RetrievedChunk[];
  return env.rerank() ? rerank(question, chunks) : chunks;
}
