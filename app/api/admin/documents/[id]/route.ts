import { getAdminUser } from "@/lib/supabase/server";
import { deleteDocument } from "@/lib/ingest";

export const runtime = "nodejs";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminUser())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    await deleteDocument(id);
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "Delete failed" }, { status: 500 });
  }
}
