import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { SourceChips } from "@/components/SourceChips";
import type { Source } from "@/lib/rag/types";

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const db = supabaseAdmin();
  const [{ data: convo }, { data: messages }, { data: leads }] = await Promise.all([
    db.from("conversations").select("id, source, session_id, created_at").eq("id", id).maybeSingle(),
    db.from("messages").select("id, role, content, sources, created_at").eq("conversation_id", id).order("created_at"),
    db.from("leads").select("name, email, interest, created_at").eq("conversation_id", id),
  ]);
  if (!convo) notFound();

  return (
    <>
      <Link href="/admin/conversations" className="text-sm text-slate hover:text-ink">
        ← All conversations
      </Link>
      <h1 className="mt-3 text-2xl font-bold">Conversation</h1>
      <p className="mt-1 text-slate">
        Started {new Date(convo.created_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })} on the{" "}
        {convo.source === "widget" ? "widget" : "website"}
      </p>

      {leads && leads.length > 0 && (
        <div className="mt-5 rounded-xl border border-ink bg-highlight-soft px-4 py-3 text-[15px]">
          {leads.map((l) => (
            <p key={l.email}>
              Lead: <strong>{l.name}</strong> ({l.email}){l.interest ? `, asked about ${l.interest}` : ""}
            </p>
          ))}
        </div>
      )}

      <ol className="mt-6 flex max-w-3xl flex-col gap-4">
        {(messages ?? []).map((m) => (
          <li
            key={m.id}
            className={
              m.role === "user"
                ? "self-end rounded-xl rounded-br-sm bg-ink px-3.5 py-2.5 text-white"
                : "rounded-xl border border-rule bg-sheet px-4 py-3"
            }
          >
            <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{m.content}</p>
            {m.role === "assistant" && <SourceChips sources={(m.sources ?? []) as Source[]} />}
          </li>
        ))}
      </ol>
    </>
  );
}
