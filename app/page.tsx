import Link from "next/link";
import { Chat } from "@/components/Chat";
import Image from "next/image";

const LIBRARY = [
  { title: "Course Catalog 2027", kind: "PDF, 4 pages" },
  { title: "Pricing Sheet 2027", kind: "PDF, 2 pages" },
  { title: "Course Schedule", kind: "PDF, 2 pages" },
  { title: "How to Enroll", kind: "PDF, 2 pages" },
  { title: "Instructor Bios", kind: "PDF, 2 pages" },
  { title: "Refund and Cancellation Policy", kind: "Word document" },
  { title: "FAQ", kind: "Word document" },
  { title: "Corporate and Group Training", kind: "Word document" },
];

export default function Home() {
  return (
    <main className="mx-auto grid min-h-dvh max-w-6xl gap-8 px-4 py-6 sm:px-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:gap-12 md:py-12">
      <div className="order-2 md:order-1 md:pt-6">
        <Image height={48} width={100} src="/Logo.png" alt="DocuMind logo" className="h-12 w-40" />
        <h1 className="mt-4 text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.05] font-extrabold tracking-[-0.02em]">
          A support assistant that only says what <span className="marker px-1">the documents say</span>.
        </h1>
        <p className="mt-5 max-w-[52ch] text-[17px] leading-relaxed text-slate">
          This demo answers questions for Brightpath Training, a fictional course provider. Each answer is built from
          the company&apos;s own PDFs and policies and cites the file and page it used. When the answer isn&apos;t in
          the documents, it says so. Ask about prices or enrolling and it offers to put you in touch with an advisor.
        </p>

        <h2 className="mt-10 text-sm font-semibold">What the assistant has read</h2>
        <ul className="mt-3 grid grid-cols-1 border-t border-rule sm:grid-cols-2 sm:gap-x-6">
          {LIBRARY.map((d) => (
            <li key={d.title} className="flex items-baseline justify-between gap-3 border-b border-rule py-2.5 text-[15px]">
              <span className="font-medium">{d.title}</span>
              <span className="shrink-0 text-[13px] text-slate">{d.kind}</span>
            </li>
          ))}
        </ul>

        <p className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-[15px]">
          <a href="/demo-site.html" className="font-medium underline underline-offset-4">
            See the embeddable widget
          </a>
          <Link href="/admin" className="font-medium underline underline-offset-4">
            Open the admin
          </Link>
        </p>
      </div>

      <div className="order-1 h-[min(78dvh,720px)] md:sticky md:top-12 md:order-2">
        <Chat />
      </div>
    </main>
  );
}
