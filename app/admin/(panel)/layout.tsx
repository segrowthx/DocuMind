import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/supabase/server";
import { SignOutButton } from "./SignOutButton";

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "Documents" },
  { href: "/admin/conversations", label: "Conversations" },
  { href: "/admin/leads", label: "Leads" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");

  return (
    <div className="min-h-dvh">
      <header className="border-b border-rule bg-sheet">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
          <Link href="/" className="font-extrabold">
            DocuMind
          </Link>
          <nav className="flex flex-1 gap-4 text-[15px]">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="text-slate hover:text-ink">
                {n.label}
              </Link>
            ))}
          </nav>
          <span className="hidden text-sm text-slate sm:inline">{user.email}</span>
          <SignOutButton />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
