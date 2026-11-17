import { supabaseAdmin } from "@/lib/supabase/admin";
import { BUCKET } from "@/lib/ingest";

export const runtime = "nodejs";

/** Opens a cited document: redirects to a short-lived signed URL (jumping to the page for PDFs). */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new Response("Not found", { status: 404 });
  const page = Number(new URL(req.url).searchParams.get("page")) || null;

  const db = supabaseAdmin();
  const { data: doc } = await db.from("documents").select("file_path, source_url").eq("id", id).maybeSingle();
  if (!doc) return new Response("Not found", { status: 404 });
  if (doc.source_url) return Response.redirect(doc.source_url, 302);

  const { data, error } = await db.storage.from(BUCKET).createSignedUrl(doc.file_path, 60 * 10);
  if (error || !data) return new Response("Not found", { status: 404 });
  const target = page && doc.file_path.toLowerCase().endsWith(".pdf") ? `${data.signedUrl}#page=${page}` : data.signedUrl;
  return Response.redirect(target, 302);
}
