import type { Source } from "@/lib/rag/types";

export function sourceHref(s: Source): string {
  if (s.url) return s.url;
  return `/api/sources/${s.documentId}${s.page ? `?page=${s.page}` : ""}`;
}

export function sourceLabel(s: Source): string {
  return s.page ? `${s.title}, p. ${s.page}` : s.title;
}

/** Groups citations by document page so "Pricing Sheet, p. 2" appears once with all its numbers. */
export function SourceChips({ sources }: { sources: Source[] }) {
  if (!sources.length) return null;
  const groups = new Map<string, { s: Source; ns: number[] }>();
  for (const s of sources) {
    const key = `${s.documentId}:${s.page ?? ""}`;
    const g = groups.get(key);
    if (g) g.ns.push(s.n);
    else groups.set(key, { s, ns: [s.n] });
  }

  return (
    <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Sources">
      {[...groups.values()].map(({ s, ns }) => (
        <li key={`${s.documentId}:${s.page}`}>
          <a
            href={sourceHref(s)}
            target="_blank"
            rel="noopener noreferrer"
            title={s.snippet}
            className="group inline-flex items-stretch overflow-hidden rounded-md border border-rule bg-sheet text-[13px] leading-none text-ink transition-colors hover:border-ink"
          >
            <span className="flex items-center bg-highlight px-1.5 font-semibold tabular-nums">{ns.join(",")}</span>
            <span className="flex items-center px-2 py-1.5">{sourceLabel(s)}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
