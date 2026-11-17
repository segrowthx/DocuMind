"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await supabaseBrowser().auth.signInWithPassword({
      email,
      password,
    });
    setBusy(false);
    if (error) {
      setError("That email and password don't match an admin account.");
      return;
    }
    const next = params.get("next");
    router.replace(next && next.startsWith("/admin") ? next : "/admin");
    router.refresh();
  }

  return (
    <form
      onSubmit={submit}
      className="relative w-full max-w-sm rounded-md bg-sheet py-8 pr-7 pl-14 text-ink"
    >
      <div className="holes" aria-hidden>
        <i />
        <i />
      </div>
      <h1 className="text-xl font-bold">Sign in to DocuMind admin</h1>
      <p className="mt-1 text-sm text-slate">
        Manage documents, conversations and leads.
      </p>
      <label className="mt-6 block text-sm font-medium">
        Email
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-md border border-rule px-3 py-2 outline-none focus:border-ink"
        />
      </label>
      <label className="mt-4 block text-sm font-medium">
        Password
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-md border border-rule px-3 py-2 outline-none focus:border-ink"
        />
      </label>
      {error && <p className="mt-3 text-sm text-danger">{error}</p>}
      <button
        disabled={busy}
        className="mt-6 w-full rounded-lg bg-tab py-3 font-semibold text-ink hover:bg-[#ff9a3d] disabled:bg-rule disabled:text-slate"
      >
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-cover px-4">
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
