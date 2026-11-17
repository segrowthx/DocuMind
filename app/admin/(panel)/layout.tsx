import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/supabase/server";
import { SignOutButton } from "./SignOutButton";
import { AdminNav } from "./AdminNav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");

  return (
    <div className="min-h-dvh bg-paper">
      <header className="bg-cover text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-end gap-x-8 gap-y-3 px-4 pt-4 sm:px-6">
          <Link href="/" className="mb-3 rounded-md bg-sheet px-2.5 py-1" aria-label="DocuMind home">
            <Image src="/Logo.png" alt="DocuMind" width={1536} height={473} className="h-7 w-auto" />
          </Link>
          <AdminNav />
          <div className="mb-3 ml-auto flex items-center gap-4 text-sm">
            <span className="hidden text-cover-ink sm:inline">{user.email}</span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
