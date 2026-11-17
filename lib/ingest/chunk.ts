import { getEncoding } from "js-tiktoken";
import type { ExtractedPage } from "./extract";

const enc = getEncoding("cl100k_base");
export const countTokens = (s: string) => enc.encode(s).length;

export interface Chunk {
  content: string;
  page: number | null;
  tokenCount: number;
}

export interface ChunkOptions {
  /** Target max tokens per chunk (spec: 500-800). */
  maxTokens?: number;
  /** Overlap carried into the next chunk (spec: 10-15%). */
  overlapTokens?: number;
}

/** Split text into units no larger than maxTokens: paragraphs, then sentences, then raw tokens. */
function units(text: string, maxTokens: number): string[] {
  const out: string[] = [];
  for (const para of text.split(/\n+/).map((p) => p.trim()).filter(Boolean)) {
    if (countTokens(para) <= maxTokens) {
      out.push(para);
      continue;
    }
    for (const sentence of para.split(/(?<=[.!?])\s+/)) {
      if (countTokens(sentence) <= maxTokens) {
        out.push(sentence);
        continue;
      }
      const toks = enc.encode(sentence);
      for (let i = 0; i < toks.length; i += maxTokens) out.push(enc.decode(toks.slice(i, i + maxTokens)));
    }
  }
  return out;
}

/**
 * Greedy paragraph packer. Chunks never span pages, so every chunk has an exact
 * page citation. The tail of each chunk (about overlapTokens) is repeated at
 * the start of the next one.
 */
export function chunkPages(pages: ExtractedPage[], opts: ChunkOptions = {}): Chunk[] {
  const maxTokens = opts.maxTokens ?? 600;
  const overlapTokens = opts.overlapTokens ?? 80;
  const chunks: Chunk[] = [];

  for (const { page, text } of pages) {
    let current: { text: string; tokens: number }[] = [];
    let currentTokens = 0;
    let freshUnits = 0; // units added since the last flush (excludes carried overlap)

    const emit = () => {
      const content = current.map((u) => u.text).join("\n");
      chunks.push({ content, page, tokenCount: countTokens(content) });
    };

    for (const u of units(text, maxTokens - overlapTokens)) {
      const t = countTokens(u);
      if (currentTokens + t > maxTokens && freshUnits > 0) {
        emit();
        const carry: typeof current = [];
        let carryTokens = 0;
        for (let i = current.length - 1; i >= 0; i--) {
          if (carryTokens + current[i].tokens > overlapTokens) break;
          carry.unshift(current[i]);
          carryTokens += current[i].tokens;
        }
        current = carry;
        currentTokens = carryTokens;
        freshUnits = 0;
      }
      current.push({ text: u, tokens: t });
      currentTokens += t;
      freshUnits++;
    }
    if (freshUnits > 0) emit();
  }
  return chunks;
}
