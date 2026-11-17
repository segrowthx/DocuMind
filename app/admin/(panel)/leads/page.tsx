import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";

export default async function LeadsPage() {
  const { data: leads } = await supabaseAdmin()
    .from("leads")
    .select("id, name, email, interest, conversation_id, created_at")
    .order("created_at", { ascending: false });

  return (
    <>
      <h1 className="text-2xl font-bold">Leads</h1>
      <p className="mt-1 text-slate">Visitors who left their details after asking about prices, enrolling or booking.</p>
      <div className="mt-6 overflow-x-auto rounded-xl border border-rule bg-sheet">
        {!leads?.length ? (
          <p className="p-6 text-slate">No leads yet. They appear here when a visitor fills in the contact form in the chat.</p>
        ) : (
          <table className="w-full min-w-[560px] text-left text-[15px]">
            <thead className="border-b border-rule text-sm text-slate">
              <tr>
                <th className="px-4 py-2.5 font-medium">Name</th>
                <th className="px-4 py-2.5 font-medium">Email</th>
                <th className="px-4 py-2.5 font-medium">Interest</th>
                <th className="px-4 py-2.5 font-medium">When</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id} className="border-b border-rule last:border-0">
                  <td className="px-4 py-3 font-medium">{l.name}</td>
                  <td className="px-4 py-3">
                    <a href={`mailto:${l.email}`} className="hover:underline">
                      {l.email}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-slate capitalize">{l.interest ?? "–"}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate">
                    {new Date(l.created_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {l.conversation_id && (
                      <Link href={`/admin/conversations/${l.conversation_id}`} className="text-sm text-slate hover:text-ink">
                        View chat
                      </Link>
                    )}
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
