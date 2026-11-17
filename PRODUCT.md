# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary: hiring clients.** Upwork and agency clients evaluating the builder for jobs such as "Build a custom AI assistant for a training business", "AI Support Chatbot Development", "Custom RAG Chatbot & Lead Qualification Agent" and "GenAI Engineer, Python/RAG/AWS". They arrive from a proposal link or a Loom, have a few minutes, and need to judge quickly whether the chatbot is accurate, trustworthy and production-ready.
- **Secondary: end visitors of the deployed business** (in the demo, prospective students of Brightpath Training). They use the chat and the embedded widget, often on a phone, to ask about courses, prices, dates and policies.
- **Operators: the business's staff** use the admin to add and remove documents, read conversations and follow up on leads.

## Product Purpose

DocuMind is a RAG chatbot that answers questions from a company's own PDFs, policies and FAQs, with file-and-page citations and lead capture. It exists as a portfolio piece proving the builder can deliver this for a client. Success: a hiring client tries the live demo, sees cited and correct answers plus honest refusals, and hires the builder.

## Positioning

A custom build the builder delivers per client, not a self-serve SaaS. Brightpath Training is the worked example. The differentiator is verifiable trust: every answer cites the exact file and page, the bot says "I don't know" outside its documents, and a published 20-question test backs the accuracy claim.

## Operating Context

- Clients watch a ~90-second Loom, open the live demo link, ask a few questions, click citations, try an out-of-scope question, and may open the widget demo page and admin.
- Visitors use the chat on the site or inside the widget iframe on a third-party site (WordPress or any HTML page), frequently on mobile.
- Staff use the admin on desktop.

## Capabilities and Constraints

- Upload PDF, DOCX, TXT/MD and web pages; chunk, embed (Gemini `gemini-embedding-001`, 1536 dims) and store in Supabase pgvector.
- Streaming answers from Gemini with `[n]` citations mapped to file + page; source links open the PDF at the cited page.
- Fixed refusal beginning "I don't know" when the documents don't cover the question.
- Lead form (name, email) on buying intent: pricing, enrollment, booking, group/corporate.
- Admin behind Supabase Auth: documents (list, upload, delete, chunk counts), conversations with sources and unanswered counts, leads.
- Embeddable widget: one script tag that opens `/chat?embed=1` in an iframe; full screen on phones.
- Stack: Next.js 15 App Router, Tailwind v4, Supabase, Gemini, Vercel. Upload limit 4 MB per file (Vercel body limit).
- Terminology: "documents", "sources", "citations", "leads", "conversations".

## Brand Commitments

- Name: **DocuMind**. Tagline: **"Ask. Get Answers. With Sources."**
- Logo: `public/Logo.png`, a robot reading a book beside the DocuMind wordmark (navy "Docu", orange "Mind", lightbulb on the "i"). Its navy and orange are binding brand colors.
- Typeface: **Poppins** is binding.
- The demo company is **Brightpath Training**, fictional, Austin, Texas.

## Evidence on Hand

- Demo documents: `content/docs/` (8 files) generated from `content/src/*.md`.
- Accuracy test: `eval/results.md` and `eval/results.json`. Run on 2026-11-17 with `gemini-3.8-flash`: 20/20 overall, 15/15 in-scope correct with the expected document cited, 5/5 out-of-scope refused.
- Architecture diagram: Mermaid in `README.md`.
- Not available, and must not be fabricated: real client testimonials, customer logos, usage numbers, pricing for the build service, or deployment claims beyond the demo.

## Product Principles

1. Trust is shown, not claimed: citations, refusals and the test results stay visible and checkable.
2. The live demo is the pitch: a client should be able to ask a question within seconds of landing.
3. Honest about the demo: Brightpath is fictional and labelled as such.
4. The visitor experience must work on a phone and inside a small widget, not just on a desktop.
5. Operators get a calm, scannable admin, not a showcase.
