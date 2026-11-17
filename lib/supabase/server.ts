import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env, isAdminEmail } from "@/lib/env";

/** Cookie-bound client for Server Components / Route Handlers (acts as the signed-in user). */
export async function supabaseServer() {
  const cookieStore = await cookies();
  return createServerClient(env.supabaseUrl(), env.supabaseAnonKey(), {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (toSet) => {
        try {
          toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component: cookies are read-only. Middleware refreshes sessions.
        }
      },
    },
  });
}

/** Returns the signed-in admin user, or null. */
export async function getAdminUser() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user || !isAdminEmail(data.user.email)) return null;
  return data.user;
}
