"use client";

import { useState } from "react";

const TOPIC_COPY: Record<string, string> = {
  pricing: "Want an advisor to send you a quote and check which discounts apply?",
  enrollment: "Want an enrollment advisor to help you save a seat?",
  booking: "Want an advisor to get in touch and book a time with you?",
  corporate: "Want our corporate team to put together a quote for your team?",
};

export function LeadForm({
  topic,
  conversationId,
  onDone,
}: {
  topic: string | null;
  conversationId: string | null;
  onDone: (saved: boolean) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setState("saving");
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, interest: topic ?? undefined, conversationId }),
    }).catch(() => null);
    if (!res || !res.ok) {
      const data = await res?.json().catch(() => null);
      setError(data?.error ?? "Your details weren't sent. Check your connection and try again.");
      setState("idle");
      return;
    }
    setState("saved");
    onDone(true);
  }

  if (state === "saved") {
    return (
      <p className="mt-3 rounded-lg border border-rule bg-sheet px-3 py-2.5 text-sm" role="status">
        Thanks, {name.split(" ")[0]}. An advisor will email you within one business day.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="mt-3 rounded-lg border border-ink/80 bg-sheet p-3 text-sm">
      <p className="mb-2.5 font-medium">{TOPIC_COPY[topic ?? ""] ?? TOPIC_COPY.enrollment}</p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="flex-1">
          <span className="sr-only">Your name</span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            autoComplete="name"
            className="w-full rounded-md border border-rule px-2.5 py-2 outline-none focus:border-ink"
          />
        </label>
        <label className="flex-1">
          <span className="sr-only">Email</span>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            autoComplete="email"
            className="w-full rounded-md border border-rule px-2.5 py-2 outline-none focus:border-ink"
          />
        </label>
      </div>
      {error && <p className="mt-2 text-danger">{error}</p>}
      <div className="mt-2.5 flex items-center gap-3">
        <button
          type="submit"
          disabled={state === "saving"}
          className="rounded-md bg-ink px-3 py-2 font-medium text-white disabled:opacity-60"
        >
          {state === "saving" ? "Sending…" : "Contact me"}
        </button>
        <button type="button" onClick={() => onDone(false)} className="text-slate underline-offset-2 hover:underline">
          No thanks
        </button>
      </div>
    </form>
  );
}
