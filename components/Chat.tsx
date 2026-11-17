"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import type { Source } from "@/lib/rag/types";
import { SourceChips, sourceHref, sourceLabel } from "./SourceChips";
import { LeadForm } from "./LeadForm";

type Msg = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  streaming?: boolean;
  error?: boolean;
  lead?: { topic: string | null; open: boolean };
};

export const SUGGESTED_QUESTIONS = [
  "How much is the PMP Exam Prep Bootcamp?",
  "What happens if I cancel 10 days before my course?",
  "When does the next Python for Data Analysis course start?",
  "Do you offer group discounts?",
];

function sessionId(): string {
  try {
    let id = localStorage.getItem("documind.session");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("documind.session", id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

/** Turn "[1]" / "[1, 3]" into markdown links the renderer shows as highlighter marks. */
function linkCitations(text: string): string {
  return text.replace(/\[(\d+(?:\s*,\s*\d+)*)\](?!\()/g, (_, nums: string) =>
    nums
      .split(",")
      .map((n) => `[${n.trim()}](#cite-${n.trim()})`)
      .join(""),
  );
}

function Answer({ msg }: { msg: Msg }) {
  const byN = new Map((msg.sources ?? []).map((s) => [s.n, s]));
  return (
    <div className="prose-chat text-[15px] leading-relaxed">
      <ReactMarkdown
        components={{
          a: ({ href, children }) => {
            if (href?.startsWith("#cite-")) {
              const s = byN.get(Number(href.slice(6)));
              const mark = (
                <span className="marker mx-px px-1 text-[12px] font-semibold tabular-nums">{children}</span>
              );
              return s ? (
                <a href={sourceHref(s)} target="_blank" rel="noopener noreferrer" title={sourceLabel(s)} className="no-underline">
                  {mark}
                </a>
              ) : (
                mark
              );
            }
            return (
              <a href={href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                {children}
              </a>
            );
          },
        }}
      >
        {linkCitations(msg.content)}
      </ReactMarkdown>
      {msg.streaming && <span className="caret ml-0.5" aria-hidden />}
    </div>
  );
}

export function Chat({ embed = false }: { embed?: boolean }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [leadOffered, setLeadOffered] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [messages]);

  const patch = (id: string, fn: (m: Msg) => Msg) =>
    setMessages((ms) => ms.map((m) => (m.id === id ? fn(m) : m)));

  async function send(text: string) {
    const question = text.trim();
    if (!question || busy) return;
    setInput("");
    setBusy(true);

    const history = messages
      .filter((m) => !m.error && m.content)
      .map((m) => ({ role: m.role, content: m.content }));
    const userMsg: Msg = { id: crypto.randomUUID(), role: "user", content: question };
    const botId = crypto.randomUUID();
    setMessages((ms) => [...ms, userMsg, { id: botId, role: "assistant", content: "", streaming: true }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: question,
          history,
          conversationId,
          sessionId: sessionId(),
          source: embed ? "widget" : "web",
        }),
      });
      if (!res.ok || !res.body) throw new Error("request failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const ev = JSON.parse(line);
          if (ev.type === "meta") setConversationId(ev.conversationId);
          else if (ev.type === "text") patch(botId, (m) => ({ ...m, content: m.content + ev.delta }));
          else if (ev.type === "error") patch(botId, (m) => ({ ...m, content: ev.message, error: true, streaming: false }));
          else if (ev.type === "done") {
            const offer = ev.leadIntent?.hasIntent && !leadOffered;
            if (offer) setLeadOffered(true);
            patch(botId, (m) => ({
              ...m,
              streaming: false,
              sources: ev.sources,
              lead: offer ? { topic: ev.leadIntent.topic, open: true } : undefined,
            }));
          }
        }
      }
    } catch {
      patch(botId, (m) => ({
        ...m,
        streaming: false,
        error: true,
        content: "The assistant couldn't be reached. Check your connection and send your question again.",
      }));
    } finally {
      patch(botId, (m) => ({ ...m, streaming: false }));
      setBusy(false);
      inputRef.current?.focus();
    }
  }

  const empty = messages.length === 0;

  return (
    <section
      className={`flex min-h-0 flex-col bg-sheet ${embed ? "h-dvh" : "h-full rounded-xl border border-rule"}`}
      aria-label="Chat with the Brightpath assistant"
    >
      <header className="flex items-center gap-3 border-b border-rule px-4 py-3">
        <span className="grid size-8 place-items-center rounded-full bg-ink text-sm font-bold text-highlight" aria-hidden>
          B
        </span>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="font-semibold">Brightpath assistant</p>
          <p className="truncate text-[13px] text-slate">Answers from our course documents, with sources</p>
        </div>
        {embed && (
          <button
            type="button"
            onClick={() => window.parent.postMessage({ type: "documind:close" }, "*")}
            className="grid size-8 place-items-center rounded-md text-slate hover:bg-paper hover:text-ink"
            aria-label="Close chat"
          >
            <svg viewBox="0 0 20 20" className="size-4" aria-hidden>
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </header>

      <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto px-4 py-5" aria-live="polite">
        {empty ? (
          <div className="flex h-full flex-col justify-end">
            <p className="text-[15px] leading-relaxed">
              Hi! Ask me about Brightpath courses, prices, dates or policies. Every answer points to the document it came
              from.
            </p>
            <p className="mt-5 mb-2 text-[13px] text-slate">Try one of these</p>
            <ul className="flex flex-col items-start gap-1.5">
              {SUGGESTED_QUESTIONS.map((q) => (
                <li key={q}>
                  <button
                    type="button"
                    onClick={() => send(q)}
                    className="rounded-md border border-rule px-3 py-1.5 text-left text-sm hover:border-ink"
                  >
                    {q}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <ol className="flex flex-col gap-5">
            {messages.map((m) =>
              m.role === "user" ? (
                <li key={m.id} className="ml-10 self-end rounded-xl rounded-br-sm bg-ink px-3.5 py-2.5 text-[15px] text-white">
                  {m.content}
                </li>
              ) : (
                <li key={m.id} className="mr-4">
                  {m.content || !m.streaming ? (
                    <div className={m.error ? "text-danger" : undefined}>
                      <Answer msg={m} />
                    </div>
                  ) : (
                    <p className="text-sm text-slate">Reading the documents…</p>
                  )}
                  {!m.streaming && m.sources && <SourceChips sources={m.sources} />}
                  {m.lead?.open && (
                    <LeadForm
                      topic={m.lead.topic}
                      conversationId={conversationId}
                      onDone={(saved) => {
                        if (!saved) patch(m.id, (x) => ({ ...x, lead: undefined }));
                      }}
                    />
                  )}
                </li>
              ),
            )}
          </ol>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-end gap-2 border-t border-rule p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      >
        <label className="flex-1">
          <span className="sr-only">Your question</span>
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            maxLength={2000}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder="Ask about courses, prices, dates…"
            className="block max-h-32 w-full resize-none rounded-lg border border-rule bg-paper px-3 py-2.5 text-base outline-none focus:border-ink sm:text-[15px]"
          />
        </label>
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="rounded-lg bg-ink px-4 py-2.5 font-medium text-white disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </section>
  );
}
