function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing environment variable ${name}`);
  return v;
}

export const env = {
  supabaseUrl: () => required("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: () => required("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  supabaseServiceKey: () => required("SUPABASE_SERVICE_ROLE_KEY"),
  geminiKey: () => required("GEMINI_API_KEY"),
  chatModel: () => process.env.GEMINI_CHAT_MODEL || "gemini-3.8-flash",
  embeddingModel: () => process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001",
  /** Must match vector(N) in supabase/migrations/0001_init.sql. */
  embeddingDims: 1536,
  rerank: () => process.env.RERANK === "true",
  /** Comma-separated list of emails allowed into /admin. Empty = any signed-in user. */
  adminEmails: () =>
    (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
};

export function isAdminEmail(email: string | undefined | null): boolean {
  const list = env.adminEmails();
  if (!email) return false;
  return list.length === 0 || list.includes(email.toLowerCase());
}
