/**
 * Turns the Markdown sources in content/src into the demo PDFs and DOCX files
 * in content/docs. A line containing only `---page---` forces a page break, so
 * PDF page numbers (used for citations) are predictable.
 *
 * Usage: npm run content:build
 */
import fs from "node:fs";
import path from "node:path";
import PDFDocument from "pdfkit";
import { Document, HeadingLevel, Packer, Paragraph, TextRun, PageBreak } from "docx";

const SRC = path.join(process.cwd(), "content", "src");
const OUT = path.join(process.cwd(), "content", "docs");

const FORMATS: Record<string, "pdf" | "docx"> = {
  "course-catalog": "pdf",
  "pricing-sheet": "pdf",
  schedule: "pdf",
  "enrollment-process": "pdf",
  "instructor-bios": "pdf",
  "refund-policy": "docx",
  faq: "docx",
  "corporate-training": "docx",
};

type Block =
  | { kind: "h1" | "h2" | "h3" | "p" | "li"; text: string }
  | { kind: "page" };

function parse(md: string): Block[] {
  const blocks: Block[] = [];
  for (const raw of md.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    if (line === "---page---") blocks.push({ kind: "page" });
    else if (line.startsWith("### ")) blocks.push({ kind: "h3", text: line.slice(4) });
    else if (line.startsWith("## ")) blocks.push({ kind: "h2", text: line.slice(3) });
    else if (line.startsWith("# ")) blocks.push({ kind: "h1", text: line.slice(2) });
    else if (line.startsWith("- ")) blocks.push({ kind: "li", text: line.slice(2) });
    else blocks.push({ kind: "p", text: line });
  }
  return blocks;
}

function writePdf(blocks: Block[], file: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "LETTER", margin: 64 });
    const stream = fs.createWriteStream(file);
    doc.pipe(stream);
    for (const b of blocks) {
      switch (b.kind) {
        case "page":
          doc.addPage();
          break;
        case "h1":
          doc.font("Helvetica-Bold").fontSize(20).fillColor("#1d3557").text(b.text).moveDown(0.8);
          break;
        case "h2":
          doc.moveDown(0.4).font("Helvetica-Bold").fontSize(14).fillColor("#1d3557").text(b.text).moveDown(0.4);
          break;
        case "h3":
          doc.moveDown(0.2).font("Helvetica-Bold").fontSize(11.5).fillColor("#222").text(b.text).moveDown(0.2);
          break;
        case "li":
          doc.font("Helvetica").fontSize(10.5).fillColor("#222").text(`•  ${b.text}`, { indent: 10, paragraphGap: 4 });
          break;
        case "p":
          doc.font("Helvetica").fontSize(10.5).fillColor("#222").text(b.text, { paragraphGap: 8, lineGap: 2 });
          break;
      }
    }
    doc.end();
    stream.on("finish", () => resolve());
    stream.on("error", reject);
  });
}

async function writeDocx(blocks: Block[], file: string) {
  const children: Paragraph[] = blocks.map((b) => {
    switch (b.kind) {
      case "page":
        return new Paragraph({ children: [new PageBreak()] });
      case "h1":
        return new Paragraph({ text: b.text, heading: HeadingLevel.TITLE });
      case "h2":
        return new Paragraph({ text: b.text, heading: HeadingLevel.HEADING_1 });
      case "h3":
        return new Paragraph({ text: b.text, heading: HeadingLevel.HEADING_2 });
      case "li":
        return new Paragraph({ children: [new TextRun(b.text)], bullet: { level: 0 } });
      default:
        return new Paragraph({ children: [new TextRun(b.text)] });
    }
  });
  const doc = new Document({ sections: [{ children }] });
  fs.writeFileSync(file, await Packer.toBuffer(doc));
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  for (const [name, fmt] of Object.entries(FORMATS)) {
    const blocks = parse(fs.readFileSync(path.join(SRC, `${name}.md`), "utf8"));
    const target = path.join(OUT, `${name}.${fmt}`);
    if (fmt === "pdf") await writePdf(blocks, target);
    else await writeDocx(blocks, target);
    console.log("wrote", path.relative(process.cwd(), target));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
