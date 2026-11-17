import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const Body = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(120),
  email: z.string().trim().toLowerCase().email("Please enter a valid email").max(200),
  interest: z.string().trim().max(500).optional(),
  conversationId: z.string().uuid().nullish(),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid request" }, { status: 400 });
  }
  const { name, email, interest, conversationId } = parsed.data;
  const { error } = await supabaseAdmin()
    .from("leads")
    .insert({ name, email, interest: interest ?? null, conversation_id: conversationId ?? null });
  if (error) return Response.json({ error: "Could not save your details" }, { status: 500 });
  return Response.json({ ok: true });
}
