"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import type { Source } from "@/lib/rag/types";
import type { BinderTab } from "@/lib/library";
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

const FALLBACK_QUESTIONS = [
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

/** Turn "[1]" / "[1, 3]" into markdown links the renderer shows as citation chips. */
function linkCitations(text: string): string {
  return text.replace(/\[(\d+(?:\s*,\s*\d+)*)\](?!\()/g, (_, nums: string) =>
    nums
      .split(",")
      .map((n) => `[${n.trim()}](#cite-${n.trim()})`)
      .join(""),
  );
}

/** Fixed ramp: how far a cited tab reaches out, from its match strength. */
function reach(similarity = 0.5): number {
  const t = Math.min(1, Math.max(0, (similarity - 0.3) / 0.45));
  return Math.round(8 + t * 22);
}

function Answer({ msg, onCite }: { msg: Msg; onCite: (s: Source) => void }) {
  const byN = new Map((msg.sources ?? []).map((s) => [s.n, s]));
  return (
    <div className="prose-chat text-[15px] leading-[1.7]">
      <ReactMarkdown
        components={{
          a: ({ href, children }) => {
            if (href?.startsWith("#cite-")) {
              const s = byN.get(Number(href.slice(6)));
              const chip = "marker mx-0.5 inline-grid min-w-[1.35rem] place-items-center px-1 align-[0.1em] text-[11px] leading-[1.35rem] font-semibold tabular-nums";
              return s ? (
                <button
                  type="button"
                  onClick={() => onCite(s)}
                  title={`Show the passage from ${sourceLabel(s)}`}
                  aria-label={`Source ${children}: ${sourceLabel(s)}`}
                  className={`${chip} cursor-pointer hover:outline-2 hover:outline-ink`}
                >
                  {children}
                </button>
              ) : (
                <span className={chip}>{children}</span>
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

function Passage({ source, onClose, inset }: { source: Source; onClose: () => void; inset: boolean }) {
  return (
    <aside
      aria-label="Cited passage"
      className={`mr-4 mb-3 ml-4 rounded-lg border border-rule bg-paper px-4 py-3 sm:mr-6 ${inset ? "sm:ml-14" : "sm:ml-6"}`}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">
            <span className="marker mr-2 inline-block px-1.5 text-[11px] leading-5 tabular-nums">{source.n}</span>
            {sourceLabel(source)}
          </p>
          {typeof source.similarity === "number" && (
            <p className="mt-0.5 text-xs text-slate">{Math.round(source.similarity * 100)}% match to your question</p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close passage"
          className="grid size-7 shrink-0 place-items-center rounded-md text-slate hover:bg-rule hover:text-ink"
        >
          <svg viewBox="0 0 20 20" className="size-3.5" aria-hidden>
            <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <p className="mt-2 max-h-36 overflow-y-auto text-[13.5px] leading-relaxed whitespace-pre-line text-ink">{source.snippet}</p>
      <a
        href={sourceHref(source)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-block text-[13px] font-semibold text-tab-ink underline underline-offset-4"
      >
        Open {source.page ? `the document at page ${source.page}` : "the document"}
      </a>
    </aside>
  );
}

export interface ChatProps {
  /** "binder" draws index tabs beside the sheet; "compact" is for the narrow widget. */
  variant?: "binder" | "compact";
  tabs?: BinderTab[];
  embed?: boolean;
}

export function Chat({ variant = "compact", tabs = [], embed = false }: ChatProps) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [leadOffered, setLeadOffered] = useState(false);
  const [passage, setPassage] = useState<Source | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const tabRail = useRef<HTMLElement>(null);
  const binder = variant === "binder";

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // The most recent finished answer decides which tabs are pulled out.
  const cited = useMemo(() => {
    const last = [...messages].reverse().find((m) => m.role === "assistant" && !m.streaming);
    const best = new Map<string, Source>();
    for (const s of last?.sources ?? []) {
      const prev = best.get(s.title);
      if (!prev || (s.similarity ?? 0) > (prev.similarity ?? 0)) best.set(s.title, s);
    }
    return best;
  }, [messages]);

  // On phones the tab strip scrolls sideways: bring the first cited tab into view (without moving the page).
  useEffect(() => {
    const rail = tabRail.current;
    const first = rail?.querySelector<HTMLElement>("[data-cited]");
    if (!rail || !first || rail.scrollWidth <= rail.clientWidth) return;
    rail.scrollTo({ left: Math.max(0, first.offsetLeft - 12), behavior: "smooth" });
  }, [cited]);

  const patch = (id: string, fn: (m: Msg) => Msg) => setMessages((ms) => ms.map((m) => (m.id === id ? fn(m) : m)));

  async function send(text: string) {
    const question = text.trim();
    if (!question || busy) return;
    setInput("");
    setBusy(true);
    setPassage(null);

    const history = messages.filter((m) => !m.error && m.content).map((m) => ({ role: m.role, content: m.content }));
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
      inputRef.current?.focus({ preventScroll: true });
    }
  }

  const empty = messages.length === 0;
  const starters = tabs.length ? tabs.slice(0, 4).map((t) => t.question) : FALLBACK_QUESTIONS;
  const docCount = tabs.length || 8;

  const sheet = (
    <section
      className={`relative z-10 flex min-h-0 flex-1 flex-col bg-sheet ${
        embed ? "h-dvh" : binder ? "rounded-md lg:rounded-r-none" : "h-full rounded-xl border border-rule"
      }`}
      aria-label="Chat with the Brightpath Training assistant"
    >
      {binder && (
        <div className="holes hidden sm:flex" aria-hidden>
          <i />
          <i />
          <i />
        </div>
      )}

      <header
        className={`flex items-center gap-3 border-b-2 border-rule pr-4 ${binder ? "py-4 pl-4 sm:pl-16" : "py-3.5 pl-4"}`}
      >
        <div className="min-w-0 flex-1 leading-tight">
          <p className={binder ? "text-lg font-bold sm:text-xl" : "font-semibold"}>Brightpath Training assistant</p>
          <p className="mt-0.5 truncate text-[13px] text-slate">Answers from {docCount} company documents, with sources</p>
        </div>
        {binder && cited.size > 0 && (
          <p className="hidden shrink-0 text-right text-[13px] leading-tight text-slate sm:block">
            <span className="block text-2xl font-extrabold text-ink tabular-nums">{cited.size}</span>
            {cited.size === 1 ? "document cited" : "documents cited"}
          </p>
        )}
        {embed && (
          <button
            type="button"
            onClick={() => window.parent.postMessage({ type: "documind:close" }, "*")}
            className="grid size-9 place-items-center rounded-md text-slate hover:bg-paper hover:text-ink"
            aria-label="Close chat"
          >
            <svg viewBox="0 0 20 20" className="size-4" aria-hidden>
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </header>

      <div
        ref={scroller}
        className={`min-h-0 flex-1 overflow-y-auto py-5 pr-4 sm:pr-6 ${binder ? "pl-4 sm:pl-16" : "pl-4"}`}
        aria-live="polite"
      >
        {empty ? (
          <div className="flex h-full flex-col justify-end">
            <p className="max-w-[46ch] text-[15px] leading-relaxed">
              Ask about courses, prices, dates or policies. Every answer shows which document and page it came from, and
              if the documents don&apos;t say, neither will I.
            </p>
            <p className="mt-5 mb-2 text-[13px] font-medium text-slate">
              {binder ? "Press a tab to ask about that document, or try one of these" : "Try one of these"}
            </p>
            <ul className="flex flex-col items-start gap-1.5">
              {starters.map((q) => (
                <li key={q}>
                  <button
                    type="button"
                    onClick={() => send(q)}
                    className="rounded-md border border-rule px-3 py-1.5 text-left text-sm transition-colors hover:border-ink hover:bg-paper"
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
                <li
                  key={m.id}
                  className="ml-10 max-w-[85%] self-end rounded-2xl rounded-br-sm bg-ink px-3.5 py-2.5 text-[15px] leading-relaxed text-white"
                >
                  {m.content}
                </li>
              ) : (
                <li key={m.id} className="mr-2 max-w-[62ch]">
                  {m.content || !m.streaming ? (
                    <div className={m.error ? "text-danger" : undefined}>
                      <Answer msg={m} onCite={setPassage} />
                    </div>
                  ) : (
                    <p className="reading text-sm text-slate" role="status">
                      Searching {docCount} documents
                      <span>.</span>
                      <span>.</span>
                      <span>.</span>
                    </p>
                  )}
                  {!m.streaming && m.sources && !binder && <SourceChips sources={m.sources} />}
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

      {passage && <Passage source={passage} inset={binder} onClose={() => setPassage(null)} />}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className={`flex items-end gap-2 border-t border-rule py-3 pr-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] ${
          binder ? "pl-3 sm:pl-16" : "pl-3"
        }`}
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
            placeholder="Ask a question…"
            className="block max-h-32 w-full resize-none rounded-lg border-2 border-ink bg-sheet px-3.5 py-2.5 text-base outline-none placeholder:text-slate focus:border-tab-ink sm:text-[15px]"
          />
        </label>
        <button
          type="submit"
          aria-disabled={busy}
          onClick={(e) => {
            if (!input.trim()) {
              e.preventDefault();
              inputRef.current?.focus();
            }
          }}
          className="rounded-lg bg-tab px-5 py-3 text-[15px] font-semibold text-ink transition-colors hover:bg-[#ff9a3d] aria-disabled:opacity-60"
        >
          Ask
        </button>
      </form>
    </section>
  );

  if (!binder) return sheet;

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      {sheet}
      {/* Phones: tabs along the sheet's top edge, like divider tabs. Desktop: they overhang the right edge,
          spread over the sheet's full height. */}
      <nav
        ref={tabRail}
        aria-label="Documents the assistant has read"
        className="order-first -mb-1 flex gap-1.5 overflow-x-auto px-3 pt-1 [scrollbar-width:none] lg:absolute lg:inset-y-0 lg:left-full lg:mb-0 lg:w-44 lg:flex-col lg:justify-between lg:gap-2 lg:overflow-visible lg:px-0 lg:py-10"
      >
        {tabs.map((t) => {
          const s = cited.get(t.title);
          const out = s ? reach(s.similarity) : 0;
          return (
            <button
              key={t.title}
              type="button"
              data-cited={s ? "true" : undefined}
              disabled={!s && busy}
              onClick={() => (s ? setPassage(s) : send(t.question))}
              title={s ? `Show the cited passage from ${sourceLabel(s)}` : `Ask: ${t.question}`}
              aria-pressed={s ? passage?.title === s.title && passage?.page === s.page : undefined}
              style={{ ["--reach" as string]: `${out}px` }}
              className={`tab-reach group flex shrink-0 flex-col justify-center rounded-t-lg px-3 pt-2 pb-3 text-left text-[13px] leading-tight font-medium lg:-ml-2 lg:max-h-[4.25rem] lg:flex-1 lg:rounded-t-none lg:rounded-r-lg lg:py-2 lg:pr-3 lg:pl-5 ${
                s
                  ? "translate-y-0 bg-tab text-ink lg:w-[calc(9.5rem+var(--reach))]"
                  : "translate-y-1.5 bg-cover-2 text-cover-ink hover:translate-y-0.5 hover:bg-cover-3 hover:text-white disabled:opacity-60 lg:w-[9.5rem] lg:translate-y-0 lg:hover:w-40 lg:hover:translate-y-0"
              }`}
            >
              <span className="block whitespace-nowrap lg:whitespace-normal">{t.label}</span>
              {s && (
                <span className="mt-0.5 block text-[13px] font-bold tabular-nums">
                  {s.page ? `Page ${s.page}` : "Cited"}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
