"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin", label: "Documents" },
  { href: "/admin/conversations", label: "Conversations" },
  { href: "/admin/leads", label: "Leads" },
];

/** Section tabs that sit on the header's bottom edge, like binder dividers. */
export function AdminNav() {
  const path = usePathname();
  return (
    <nav aria-label="Admin sections" className="flex gap-1.5 overflow-x-auto">
      {NAV.map((n) => {
        const active = n.href === "/admin" ? path === "/admin" : path.startsWith(n.href);
        return (
          <Link
            key={n.href}
            href={n.href}
            aria-current={active ? "page" : undefined}
            className={`shrink-0 rounded-t-lg px-4 pt-2.5 pb-3 text-[14.5px] font-medium transition-colors ${
              active ? "bg-paper text-ink" : "bg-cover-2 text-cover-ink hover:bg-cover-3 hover:text-white"
            }`}
          >
            {n.label}
          </Link>
        );
      })}
    </nav>
  );
}
