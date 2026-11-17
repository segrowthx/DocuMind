import { supabaseAdmin } from "@/lib/supabase/admin";
import { DocumentManager, type DocRow } from "./DocumentManager";

export default async function DocumentsPage() {
  const { data, error } = await supabaseAdmin()
    .from("documents")
    .select("id, title, source_type, source_url, created_at, chunks(count)")
    .order("created_at", { ascending: false });

  const docs: DocRow[] = (data ?? []).map((d) => ({
    id: d.id,
    title: d.title,
    sourceType: d.source_type,
    sourceUrl: d.source_url,
    createdAt: d.created_at,
    chunks: (d.chunks as unknown as { count: number }[])?.[0]?.count ?? 0,
  }));

  return (
    <>
      <h1 className="text-2xl font-bold">Documents</h1>
      <p className="mt-1 text-slate">The assistant answers only from these. Changes apply to the next question asked.</p>
      {error && <p className="mt-4 text-danger">Documents couldn&apos;t be loaded: {error.message}</p>}
      <DocumentManager docs={docs} />
    </>
  );
}
