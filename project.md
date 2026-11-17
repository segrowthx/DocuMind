DocuMind, a RAG chatbot over business documents
Pitch: A chatbot that answers questions from a company's own PDFs, policies and FAQs, with citations and lead capture.
Demo niche: A training business with course PDFs, pricing sheets and a FAQ.
Matches jobs like: "Build a custom AI assistant for a training business", "AI Support Chatbot Development", "Custom RAG Chatbot & Lead Qualification Agent", "GenAI Engineer, Python/RAG/AWS".
Features
Upload PDFs, DOCX and web pages, then chat with them.
Answers include source citations (file and page).
Says "I don't know" when the answer is not in the documents.
Captures name and email when the visitor shows buying intent.
Admin page to add or remove documents and view conversations.
Embeddable chat widget for WordPress or any site.
Stack: Next.js, Supabase (Postgres with pgvector), an LLM API (Claude or OpenAI), an embeddings model, Vercel.
Build steps
Collect demo content. Write or generate 6 to 10 realistic documents for a fictional training company (course catalog, refund policy, schedule, pricing, FAQ).
Set up the project. Create a Next.js app and a Supabase project. Enable the pgvector extension.
Create tables. documents (id, title, file path), chunks (id, document id, content, page, embedding), conversations and leads.
Build ingestion. Extract text, split it into chunks of roughly 500 to 800 tokens with 10 to 15 percent overlap, create embeddings and store them.
Build retrieval. Embed the question, fetch the top 5 to 8 chunks by similarity, then optionally re-rank them.
Build the answer prompt. Instruct the model to answer only from the provided chunks, cite sources, and say it does not know otherwise.
Build the chat UI. Streaming responses, source chips under each answer, and a suggested-questions list.
Add lead capture. Detect intent phrases (pricing, enrollment, booking) and show a short form. Save leads to the leads table.
Build the admin page. Document list, upload, delete, and a conversation log.
Write 20 test questions. Include 5 that are not covered by the documents. Record accuracy in a small table.
Create the widget. A small script tag that loads the chat in an iframe so it can be embedded on a WordPress site.
Deploy to Vercel and test on a phone.
Done when: The bot answers 18 of 20 test questions correctly, refuses the 5 out-of-scope ones, and the widget works on a separate demo page.
Publish: Live demo link, a 90-second Loom, the 20-question test table, and an architecture diagram.
Proposal line: "I built a RAG chatbot with citations and lead capture for a training business. Here is the live demo and the accuracy results."
