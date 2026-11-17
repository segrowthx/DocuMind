import { randomUUID } from "node:crypto";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { extractFile, extractUrl, type Extracted } from "./extract";
import { chunkPages } from "./chunk";
import { embedMany } from "./embed";

export const BUCKET = "documents";

export interface IngestResult {
  documentId: string;
  title: string;
  chunks: number;
}

async function store(extracted: Extracted, meta: { filePath?: string; sourceUrl?: string }): Promise<IngestResult> {
  const db = supabaseAdmin();
  const chunks = chunkPages(extracted.pages);
  if (!chunks.length) throw new Error("No text could be extracted from this document.");

  // Prefix the title so each embedding carries document context.
  const embeddings = await embedMany(chunks.map((c) => `${extracted.title}\n\n${c.content}`));

  const { data: doc, error } = await db
    .from("documents")
    .insert({
      title: extracted.title,
      source_type: extracted.sourceType,
      file_path: meta.filePath ?? null,
      source_url: meta.sourceUrl ?? null,
    })
    .select("id")
    .single();
  if (error || !doc) throw new Error(`Failed to save document: ${error?.message}`);

  const rows = chunks.map((c, i) => ({
    document_id: doc.id,
    content: c.content,
    page: c.page,
    chunk_index: i,
    token_count: c.tokenCount,
    embedding: JSON.stringify(embeddings[i]),
  }));
  const { error: chunkErr } = await db.from("chunks").insert(rows);
  if (chunkErr) {
    await db.from("documents").delete().eq("id", doc.id);
    throw new Error(`Failed to save chunks: ${chunkErr.message}`);
  }
  return { documentId: doc.id, title: extracted.title, chunks: rows.length };
}

export async function ingestFile(buffer: Buffer, filename: string, mime?: string, title?: string) {
  const extracted = await extractFile(buffer, filename, mime);
  if (title) extracted.title = title;

  const filePath = `${randomUUID()}/${filename.replace(/[^\w.\-]+/g, "_")}`;
  const { error } = await supabaseAdmin()
    .storage.from(BUCKET)
    .upload(filePath, buffer, { contentType: mime || "application/octet-stream" });
  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  try {
    return await store(extracted, { filePath });
  } catch (e) {
    await supabaseAdmin().storage.from(BUCKET).remove([filePath]);
    throw e;
  }
}

export async function ingestUrl(url: string) {
  const extracted = await extractUrl(url);
  return store(extracted, { sourceUrl: url });
}

export async function deleteDocument(id: string) {
  const db = supabaseAdmin();
  const { data: doc } = await db.from("documents").select("file_path").eq("id", id).single();
  if (doc?.file_path) await db.storage.from(BUCKET).remove([doc.file_path]);
  // chunks are removed by ON DELETE CASCADE
  const { error } = await db.from("documents").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
