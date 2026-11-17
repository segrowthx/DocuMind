/**
 * Ingests every file in content/docs into Supabase.
 *   npm run seed            # add documents whose title isn't already stored
 *   npm run seed -- --reset # delete ALL documents first, then ingest
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import fs from "node:fs";
import path from "node:path";
import { ingestFile, deleteDocument } from "@/lib/ingest";
import { titleFromFilename } from "@/lib/ingest/extract";
import { supabaseAdmin } from "@/lib/supabase/admin";

const DIR = path.join(process.cwd(), "content", "docs");
// Friendly titles shown in citations; anything else falls back to the filename.
const TITLES: Record<string, string> = {
  "course-catalog": "Course Catalog 2027",
  "pricing-sheet": "Pricing Sheet 2027",
  schedule: "Course Schedule Jan-Jun 2027",
  "enrollment-process": "How to Enroll",
  "instructor-bios": "Instructor Bios",
  "refund-policy": "Refund, Cancellation and Transfer Policy",
  faq: "FAQ",
  "corporate-training": "Corporate and Group Training",
};
const MIME: Record<string, string> = {
  ".pdf": "application/pdf",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".md": "text/markdown",
  ".txt": "text/plain",
};

async function main() {
  const db = supabaseAdmin();
  const { data: existing, error } = await db.from("documents").select("id, title");
  if (error) throw new Error(`Can't reach Supabase: ${error.message}. Did you run the migration?`);

  if (process.argv.includes("--reset")) {
    for (const d of existing ?? []) await deleteDocument(d.id);
    console.log(`deleted ${existing?.length ?? 0} existing documents`);
  }
  const have = new Set(process.argv.includes("--reset") ? [] : (existing ?? []).map((d) => d.title));

  const files = fs.readdirSync(DIR).filter((f) => MIME[path.extname(f)]);
  if (!files.length) throw new Error("content/docs is empty. Run `npm run content:build` first.");

  for (const f of files) {
    const title = TITLES[path.basename(f, path.extname(f))] ?? titleFromFilename(f);
    if (have.has(title)) {
      console.log(`skip  ${f} (already ingested)`);
      continue;
    }
    const r = await ingestFile(fs.readFileSync(path.join(DIR, f)), f, MIME[path.extname(f)], title);
    console.log(`added ${f} -> ${r.chunks} chunks`);
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
