---
version: 1
slug: "app-page-tsx"
primary_target: "app/page.tsx"
related_targets: ["components/Chat.tsx","app/chat/page.tsx"]
---

## Scope

Home page (`/`) of the DocuMind demo. Mode: Persuade. The chat component, widget page (`/chat`) and admin are built in the same world at Operate register (calmer, denser, same materials).

## Audience, job, action

- Hiring clients (Upwork/agency) evaluating the builder for a RAG chatbot job. A few minutes, arriving from a proposal or Loom.
- Primary action: ask the live chat a question within seconds of landing. The chat input is in the first viewport.
- Proof below the fold: how it works (ingest → embed → retrieve → cite), the accuracy results (20/20, 15/15 cited, 5/5 refused, from eval/results.md), and the widget + admin.
- Constraints: logo `public/Logo.png`, brand navy + orange, Poppins, tagline "Ask. Get Answers. With Sources." Brightpath is fictional and labelled so. No invented testimonials, prices or clients; no contact details exist yet.

## Direction contract

THESIS: The company's own policy binder, opened at the page that answers you. Every citation is an index tab that slides out of the binder. It refuses the category default of a split hero with a chat mockup above a row of feature cards.

OWN-WORLD: Navy board-cover ground (#14254A family) with a white punched sheet as the working surface. Eight flat index tabs, one per document, run down the sheet's right edge in muted navy. The cited tab turns brand orange with navy text and reaches further out. Orange is also the citation number chip. Flat shapes with no shading; ring holes are plain circles of the ground colour. Poppins throughout, from 800 for display down to 400 for body.

STORY: The visitor sees a real chatbot sitting in the company's binder, asks a question, and watches the answer pull the exact tab and page. They believe it because the 20/20 test and honest refusals sit beside it. Then they scroll to see how it's built, the widget and the admin.

FIRST VIEWPORT: Navy ground with the logo top-left and section links top-right. On the left third: a monumental Poppins headline using the tagline, two lines of plain copy, and a 20/20 · 5/5 result row. On the right two-thirds: the punched white sheet containing the live chat, with the input pinned at its bottom as the primary action. The tab column runs along the sheet's right edge. On phones the sheet comes first and the tabs become a horizontal strip above the input.

FORM: The Policy Binder, item 5 of the ordered grounded list (assigned by the roll). seed:db0edaef4e14fa63. Raises: from Star Atlas, a fixed ramp where a tab's reach shows match strength; from Jacquard, any tab opens the exact passage used; from Rhythm Machine, unused tabs offer suggested questions in the empty state. Signature interaction: a cited tab slides out and lights orange as the answer finishes; clicking it reveals the passage. Motion grammar: one slide per citation, 200 ms ease-out, none when the user prefers reduced motion.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Recorded adaptations

- Phone tab strip sits on the sheet's top edge (divider-tab position), not above the input: above the input it would collide with the on-screen keyboard. The strip auto-scrolls the first cited tab into view.
- Punch holes hide below 640px, where the margin they need would squeeze the chat text.
- Logo sits on a white label plate because Logo.png has an opaque white background.
- Headline uses the logo lockup's title case (binding brand).

## Unresolved

- A hire-me close needs real contact details from the user; none yet, so the page ends on the widget/admin section and a GitHub/README link only if provided.
