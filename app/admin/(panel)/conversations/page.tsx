import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";

export default async function ConversationsPage() {
  const db = supabaseAdmin();
  const { data } = await db
    .from("conversations")
    .select("id, source, created_at, messages(role, content, created_at), leads(id)")
    .order("created_at", { ascending: false })
    .limit(100);

  const rows = (data ?? []).map((c) => {
    const msgs = (c.messages as { role: string; content: string; created_at: string }[]).sort((a, b) =>
      a.created_at.localeCompare(b.created_at),
    );
    return {
      id: c.id as string,
      source: c.source as string,
      createdAt: c.created_at as string,
      first: msgs.find((m) => m.role === "user")?.content ?? "(empty)",
      questions: msgs.filter((m) => m.role === "user").length,
      refusals: msgs.filter((m) => m.role === "assistant" && m.content.startsWith("I don't know")).length,
      lead: (c.leads as unknown[]).length > 0,
    };
  });

  return (
    <>
      <h1 className="text-2xl font-bold">Conversations</h1>
      <p className="mt-1 text-slate">The latest 100 chats. Questions the assistant couldn&apos;t answer show what to add to your documents.</p>
      <div className="mt-6 overflow-x-auto rounded-xl border border-rule bg-sheet">
        {rows.length === 0 ? (
          <p className="p-6 text-slate">No conversations yet. Ask the assistant a question on the home page to see it here.</p>
        ) : (
          <table className="w-full min-w-[640px] text-left text-[15px]">
            <thead className="border-b border-rule text-sm text-slate">
              <tr>
                <th className="px-4 py-2.5 font-medium">First question</th>
                <th className="px-4 py-2.5 text-right font-medium">Questions</th>
                <th className="px-4 py-2.5 text-right font-medium">Unanswered</th>
                <th className="px-4 py-2.5 font-medium">Lead</th>
                <th className="px-4 py-2.5 font-medium">Where</th>
                <th className="px-4 py-2.5 font-medium">When</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-rule last:border-0">
                  <td className="max-w-[360px] truncate px-4 py-3">
                    <Link href={`/admin/conversations/${r.id}`} className="font-medium hover:underline">
                      {r.first}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{r.questions}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{r.refusals || "–"}</td>
                  <td className="px-4 py-3">{r.lead ? <span className="marker px-1.5 text-sm font-medium">Captured</span> : ""}</td>
                  <td className="px-4 py-3 text-slate">{r.source === "widget" ? "Widget" : "Website"}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate">
                    {new Date(r.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
