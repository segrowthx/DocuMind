import fs from "node:fs/promises";
import path from "node:path";
import Image from "next/image";
import Link from "next/link";
import { Chat } from "@/components/Chat";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { DEMO_TITLES, sortTitles, toTab } from "@/lib/library";

export const revalidate = 300;

interface EvalRow {
  id: number;
  question: string;
  outOfScope?: boolean;
  pass: boolean;
  citedTitles: string[];
}
interface EvalFile {
  summary: { model: string; date: string; total: string; inScope: string; citedExpectedDoc: string; refusedOutOfScope: string };
  results: EvalRow[];
}

async function loadTitles(): Promise<string[]> {
  try {
    const { data, error } = await supabaseAdmin().from("documents").select("title");
    if (error || !data?.length) return DEMO_TITLES;
    return sortTitles(data.map((d) => d.title as string));
  } catch {
    return DEMO_TITLES;
  }
}

async function loadEval(): Promise<EvalFile | null> {
  try {
    return JSON.parse(await fs.readFile(path.join(process.cwd(), "eval", "results.json"), "utf8")) as EvalFile;
  } catch {
    return null;
  }
}

const STEPS = [
  {
    title: "Read",
    body: "PDFs, Word files and web pages are split page by page, so every passage remembers exactly where it came from.",
  },
  {
    title: "Index",
    body: "Passages of about 600 tokens, overlapping slightly, are embedded with Gemini and stored in Postgres with pgvector.",
  },
  {
    title: "Retrieve",
    body: "Each question is embedded the same way and the 8 closest passages are pulled from the database.",
  },
  {
    title: "Answer",
    body: "Gemini answers only from those passages and numbers each claim. Nothing relevant found means a plain “I don’t know”.",
  },
];

function Check({ ok }: { ok: boolean }) {
  return ok ? (
    <svg viewBox="0 0 20 20" className="size-4 text-ink" aria-label="Passed">
      <circle cx="10" cy="10" r="9" fill="var(--tab)" />
      <path d="M6 10.5l2.6 2.5L14 7.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg viewBox="0 0 20 20" className="size-4 text-danger" aria-label="Failed">
      <circle cx="10" cy="10" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 7l6 6M13 7l-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/** A white binder sheet with punch holes and its own index tab. */
function Sheet({ id, tab, children }: { id: string; tab: string; children: React.ReactNode }) {
  return (
    <section id={id} className="relative scroll-mt-6">
      <div className="relative z-10 rounded-md bg-sheet px-5 py-10 sm:pr-10 sm:pl-16 lg:pr-14 lg:pl-20 lg:py-14">
        <div className="holes hidden sm:flex" aria-hidden>
          <i />
          <i />
          <i />
        </div>
        {children}
      </div>
      <span
        aria-hidden
        className="absolute top-10 right-0 hidden translate-x-full rounded-r-lg bg-sheet py-2.5 pr-4 pl-3 text-[12.5px] font-semibold text-ink lg:block"
      >
        {tab}
      </span>
    </section>
  );
}

export default async function Home() {
  const [titles, evalData] = await Promise.all([loadTitles(), loadEval()]);
  const tabs = titles.map(toTab);
  const summary = evalData?.summary;

  return (
    <div className="min-h-dvh bg-cover text-white">
      <header className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-8 gap-y-3 px-4 pt-5 sm:px-8 lg:px-10">
        <Link href="/" className="rounded-md bg-sheet px-3 py-1.5" aria-label="DocuMind home">
          <Image src="/Logo.png" alt="DocuMind" width={1536} height={473} priority className="h-9 w-auto sm:h-10" />
        </Link>
        <nav aria-label="Sections" className="flex flex-wrap gap-x-6 gap-y-1 text-[15px] text-cover-ink">
          <a href="#how" className="hover:text-white">
            How it works
          </a>
          {summary && (
            <a href="#accuracy" className="hover:text-white">
              Accuracy
            </a>
          )}
          <a href="#widget" className="hover:text-white">
            Widget &amp; admin
          </a>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-20 sm:px-8 lg:px-10">
        {/* First viewport: the binder */}
        <div className="grid grid-cols-[minmax(0,1fr)] gap-8 pt-6 lg:mr-44 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:gap-12 lg:pt-12">
          <div className="order-2 lg:order-1 lg:pt-6">
            <h1 className="text-[clamp(2.3rem,3.6vw,3.5rem)] leading-[1.04] font-extrabold tracking-[-0.03em]">
              Ask. Get Answers. <span className="whitespace-nowrap text-tab">With Sources.</span>
            </h1>
            <p className="mt-6 max-w-[44ch] text-[17px] leading-relaxed text-cover-ink">
              A support chatbot that answers from a company&apos;s own documents and shows the exact page it used. If
              the answer isn&apos;t in them, it says so. I build it for each client on their own documents; this one runs on Brightpath Training, a fictional course provider.
            </p>
            {summary && (
              <dl className="mt-9 flex flex-wrap gap-x-10 gap-y-4 border-t border-cover-3 pt-6">
                <div className="flex flex-col">
                  <dt className="order-last mt-2 text-sm text-cover-ink">Test questions answered correctly</dt>
                  <dd className="text-[2.1rem] leading-none font-bold tracking-[-0.02em] tabular-nums">{summary.total.replace("/", " of ")}</dd>
                </div>
                <div className="flex flex-col">
                  <dt className="order-last mt-2 text-sm text-cover-ink">Off-topic questions refused</dt>
                  <dd className="text-[2.1rem] leading-none font-bold tracking-[-0.02em] tabular-nums">{summary.refusedOutOfScope.replace("/", " of ")}</dd>
                </div>
              </dl>
            )}
          </div>

          <div className="order-1 h-[min(82dvh,760px)] min-h-[520px] text-ink lg:order-2">
            <Chat variant="binder" tabs={tabs} />
          </div>
        </div>

        <div className="mt-24 flex flex-col gap-10 text-ink lg:mr-44">
          {/* How it works */}
          <Sheet id="how" tab="How it works">
            <h2 className="text-3xl font-bold tracking-[-0.02em] sm:text-4xl">How it finds the page</h2>
            <p className="mt-3 max-w-[60ch] text-[16px] leading-relaxed text-slate">
              Retrieval-augmented generation with one rule the model can&apos;t skip: no passage, no answer.
            </p>
            <ol className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-x-8 gap-y-8 sm:grid-cols-2 xl:grid-cols-4">
              {STEPS.map((s, i) => (
                <li key={s.title} className="border-t-2 border-ink pt-4">
                  <h3 className="text-xl font-bold">
                    <span className="mr-2 text-tab-ink tabular-nums">{i + 1}</span>
                    {s.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-slate">{s.body}</p>
                </li>
              ))}
            </ol>
            <p className="mt-10 max-w-[68ch] rounded-lg bg-paper px-5 py-4 text-[15px] leading-relaxed">
              <strong className="font-semibold">Leads, too.</strong> When a visitor asks about prices, enrolling,
              booking or group training, the chat offers a short name-and-email form. Leads land in the admin next to the
              conversation that produced them.
            </p>
          </Sheet>

          {/* Accuracy */}
          {evalData && summary && (
            <Sheet id="accuracy" tab="Accuracy">
              <h2 className="text-3xl font-bold tracking-[-0.02em] sm:text-4xl">
                {summary.total.replace("/", " of ")} test questions answered correctly
              </h2>
              <p className="mt-3 max-w-[64ch] text-[16px] leading-relaxed text-slate">
                Fifteen questions the documents cover, scored against the right answer ({summary.inScope} correct,{" "}
                {summary.citedExpectedDoc} citing the right document). Five they don&apos;t cover, where the only correct
                reply is &ldquo;I don&apos;t know&rdquo; ({summary.refusedOutOfScope} refused). Run on {summary.date} with{" "}
                {summary.model}.
              </p>
              <div className="mt-8 overflow-x-auto rounded-lg border border-rule">
                <table className="w-full min-w-[640px] text-left text-[14.5px]">
                  <thead className="bg-paper text-[13px] text-slate">
                    <tr>
                      <th scope="col" className="w-12 px-4 py-2.5 font-medium">#</th>
                      <th scope="col" className="px-4 py-2.5 font-medium">Question</th>
                      <th scope="col" className="px-4 py-2.5 font-medium">Expected</th>
                      <th scope="col" className="px-4 py-2.5 font-medium">Source cited</th>
                      <th scope="col" className="w-20 px-4 py-2.5 font-medium">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evalData.results.map((r) => (
                      <tr key={r.id} className="border-t border-rule">
                        <td className="px-4 py-2.5 text-slate tabular-nums">{r.id}</td>
                        <td className="px-4 py-2.5 font-medium">{r.question}</td>
                        <td className="px-4 py-2.5 text-slate">{r.outOfScope ? "Refuse: not in the documents" : "Answer with citation"}</td>
                        <td className="px-4 py-2.5 text-slate">{r.citedTitles.length ? r.citedTitles.join("; ") : "None"}</td>
                        <td className="px-4 py-2.5">
                          <span className="inline-flex items-center gap-1.5 text-[13px] font-medium">
                            <Check ok={r.pass} />
                            {r.pass ? "Pass" : "Fail"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Sheet>
          )}

          {/* Widget & admin */}
          <Sheet id="widget" tab="Widget & admin">
            <h2 className="text-3xl font-bold tracking-[-0.02em] sm:text-4xl">On any website, managed from one place</h2>
            <div className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-2">
              <div>
                <h3 className="text-xl font-bold">One line to embed</h3>
                <p className="mt-2 max-w-[52ch] text-[15px] leading-relaxed text-slate">
                  Paste a script tag into WordPress or any HTML page. A chat button appears in the corner and opens full
                  screen on phones.
                </p>
                <pre className="mt-5 overflow-x-auto rounded-lg bg-cover px-4 py-4 text-[13px] leading-relaxed text-cover-ink">
                  <code>{`<script src="https://your-site/widget.js" defer\n  data-label="Ask about courses"></script>`}</code>
                </pre>
                <a
                  href="/demo-site.html"
                  className="mt-5 inline-block rounded-lg bg-tab px-5 py-3 text-[15px] font-semibold text-ink hover:bg-[#ff9a3d]"
                >
                  Open the widget demo
                </a>
              </div>
              <div>
                <h3 className="text-xl font-bold">An admin for the team</h3>
                <ul className="mt-3 flex flex-col gap-3 text-[15px] leading-relaxed">
                  {[
                    ["Documents", "Upload PDFs, Word files or web pages; remove them and the answers change with the next question."],
                    ["Conversations", "Every chat with its sources, plus the questions the bot couldn't answer."],
                    ["Leads", "Name, email and interest, linked to the conversation."],
                  ].map(([t, d]) => (
                    <li key={t} className="border-t border-rule pt-3">
                      <span className="font-semibold">{t}.</span> <span className="text-slate">{d}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/admin"
                  className="mt-6 inline-block rounded-lg border-2 border-ink px-5 py-2.5 text-[15px] font-semibold hover:bg-paper"
                >
                  Open the admin
                </Link>
              </div>
            </div>
          </Sheet>
        </div>
      </main>

      <footer className="border-t border-cover-3">
        <p className="mx-auto max-w-7xl px-4 py-8 text-sm text-cover-ink sm:px-8 lg:px-10">
          Brightpath Training and its documents are fictional, written for this demo. Built with Next.js, Supabase
          (pgvector) and Google Gemini.
        </p>
      </footer>
    </div>
  );
}
