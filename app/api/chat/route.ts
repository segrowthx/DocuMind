import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { prepareAnswer, streamAnswer, citedSources } from "@/lib/rag/answer";
import { detectIntent } from "@/lib/intent";
import { isRefusal } from "@/lib/rag/prompt";

export const runtime = "nodejs";
export const maxDuration = 60;

const Body = z.object({
  message: z.string().trim().min(1).max(2000),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(8000) }))
    .max(20)
    .default([]),
  conversationId: z.string().uuid().nullish(),
  sessionId: z.string().min(1).max(100),
  source: z.enum(["web", "widget"]).default("web"),
});

/**
 * Streams newline-delimited JSON events:
 *   {"type":"meta","conversationId":"..."}
 *   {"type":"text","delta":"..."}          (repeated)
 *   {"type":"done","sources":[...],"leadIntent":{...},"refused":false}
 *   {"type":"error","message":"..."}
 */
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid request" }, { status: 400 });
  const { message, history, sessionId, source } = parsed.data;
  const db = supabaseAdmin();

  // Find or create the conversation.
  let conversationId = parsed.data.conversationId ?? null;
  if (conversationId) {
    const { data } = await db.from("conversations").select("id").eq("id", conversationId).maybeSingle();
    if (!data) conversationId = null;
  }
  if (!conversationId) {
    const { data, error } = await db
      .from("conversations")
      .insert({ session_id: sessionId, source })
      .select("id")
      .single();
    if (error) return Response.json({ error: "Could not start conversation" }, { status: 500 });
    conversationId = data.id as string;
  }
  await db.from("messages").insert({ conversation_id: conversationId, role: "user", content: message });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: unknown) => controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
      send({ type: "meta", conversationId });
      let answer = "";
      try {
        const prepared = await prepareAnswer(message, history);
        for await (const delta of streamAnswer(prepared)) {
          answer += delta;
          send({ type: "text", delta });
        }
        const refused = isRefusal(answer);
        const sources = refused ? [] : citedSources(answer, prepared.sources);
        send({ type: "done", sources, refused, leadIntent: detectIntent(message) });
        await db
          .from("messages")
          .insert({ conversation_id: conversationId, role: "assistant", content: answer, sources });
      } catch (e) {
        console.error("chat error", e);
        send({ type: "error", message: "Sorry, something went wrong. Please try again." });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
