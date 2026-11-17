import { extractText, getDocumentProxy } from "unpdf";
import mammoth from "mammoth";
import { parseHTML } from "linkedom";
import { Readability } from "@mozilla/readability";

export type SourceType = "pdf" | "docx" | "url" | "text";

export interface ExtractedPage {
  /** 1-based page number, or null when the format has no pages (DOCX, web, text). */
  page: number | null;
  text: string;
}

export interface Extracted {
  title: string;
  sourceType: SourceType;
  pages: ExtractedPage[];
}

const clean = (s: string) =>
  s
    .replace(/\u0000/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

export function titleFromFilename(filename: string): string {
  const base = filename.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
  return base.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function detectType(filename: string, mime?: string): SourceType | null {
  const f = filename.toLowerCase();
  if (f.endsWith(".pdf") || mime === "application/pdf") return "pdf";
  if (f.endsWith(".docx") || mime?.includes("wordprocessingml")) return "docx";
  if (f.endsWith(".md") || f.endsWith(".txt") || mime?.startsWith("text/")) return "text";
  return null;
}

export async function extractFile(buffer: Buffer, filename: string, mime?: string): Promise<Extracted> {
  const type = detectType(filename, mime);
  const title = titleFromFilename(filename);

  if (type === "pdf") {
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const { text } = await extractText(pdf, { mergePages: false });
    return {
      title,
      sourceType: "pdf",
      pages: text.map((t, i) => ({ page: i + 1, text: clean(t) })).filter((p) => p.text),
    };
  }

  if (type === "docx") {
    const { value } = await mammoth.extractRawText({ buffer });
    return { title, sourceType: "docx", pages: [{ page: null, text: clean(value) }] };
  }

  if (type === "text") {
    return { title, sourceType: "text", pages: [{ page: null, text: clean(buffer.toString("utf8")) }] };
  }

  throw new Error(`Unsupported file type: ${filename}. Upload a PDF, DOCX, TXT or MD file.`);
}

export async function extractUrl(url: string): Promise<Extracted> {
  const res = await fetch(url, {
    headers: { "User-Agent": "DocuMindBot/1.0 (document ingestion)" },
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`Could not fetch ${url} (HTTP ${res.status})`);
  const html = await res.text();
  const { document } = parseHTML(html);
  // Readability expects a DOM Document; the linkedom document is compatible enough for article extraction.
  const article = new Readability(document as unknown as Document).parse();
  const text = clean(article?.textContent || document.body?.textContent || "");
  if (!text) throw new Error(`No readable text found at ${url}`);
  return {
    title: (article?.title || document.title || new URL(url).hostname).trim(),
    sourceType: "url",
    pages: [{ page: null, text }],
  };
}
