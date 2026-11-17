import { z } from "zod";
import { getAdminUser } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { ingestFile, ingestUrl } from "@/lib/ingest";
import { detectType } from "@/lib/ingest/extract";

export const runtime = "nodejs";
export const maxDuration = 60;

// Vercel caps serverless request bodies at 4.5 MB.
const MAX_BYTES = 4 * 1024 * 1024;

export async function GET() {
  if (!(await getAdminUser())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await supabaseAdmin()
    .from("documents")
    .select("id, title, source_type, file_path, source_url, created_at, chunks(count)")
    .order("created_at", { ascending: false });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ documents: data });
}

/** Accepts multipart form data with `file` (PDF/DOCX/TXT/MD) or `url`. */
export async function POST(req: Request) {
  if (!(await getAdminUser())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const form = await req.formData();
    const url = form.get("url");
    const file = form.get("file");
    const title = (form.get("title") as string | null)?.trim() || undefined;

    if (typeof url === "string" && url.trim()) {
      const parsed = z.string().url().safeParse(url.trim());
      if (!parsed.success || !/^https?:/i.test(parsed.data)) {
        return Response.json({ error: "Enter a valid http(s) URL" }, { status: 400 });
      }
      return Response.json(await ingestUrl(parsed.data));
    }

    if (file instanceof File) {
      if (file.size > MAX_BYTES) return Response.json({ error: "File is larger than 4 MB" }, { status: 400 });
      if (!detectType(file.name, file.type)) {
        return Response.json({ error: "Upload a PDF, DOCX, TXT or MD file" }, { status: 400 });
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      return Response.json(await ingestFile(buffer, file.name, file.type, title));
    }

    return Response.json({ error: "Provide a file or a URL" }, { status: 400 });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "Ingestion failed" }, { status: 500 });
  }
}
