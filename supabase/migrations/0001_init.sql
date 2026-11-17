-- DocuMind schema: documents, chunks (pgvector), conversations, messages, leads.
-- Run in the Supabase SQL editor (or `supabase db push`).

create extension if not exists vector;

-- Documents ------------------------------------------------------------------
create table if not exists public.documents (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  source_type text not null check (source_type in ('pdf', 'docx', 'url', 'text')),
  file_path   text,            -- path inside the "documents" storage bucket
  source_url  text,            -- for web pages
  created_at  timestamptz not null default now()
);

-- Chunks ---------------------------------------------------------------------
create table if not exists public.chunks (
  id          bigserial primary key,
  document_id uuid not null references public.documents(id) on delete cascade,
  content     text not null,
  page        int,             -- 1-based page for PDFs, null otherwise
  chunk_index int not null,
  token_count int not null,
  embedding   vector(1536) not null
);

create index if not exists chunks_document_id_idx on public.chunks (document_id);
create index if not exists chunks_embedding_idx on public.chunks
  using hnsw (embedding vector_cosine_ops);

-- Conversations & messages ---------------------------------------------------
create table if not exists public.conversations (
  id         uuid primary key default gen_random_uuid(),
  session_id text not null,
  source     text not null default 'web',   -- 'web' | 'widget' | 'eval'
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id              bigserial primary key,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role            text not null check (role in ('user', 'assistant')),
  content         text not null,
  sources         jsonb not null default '[]'::jsonb,
  created_at      timestamptz not null default now()
);

create index if not exists messages_conversation_idx on public.messages (conversation_id, created_at);

-- Leads ----------------------------------------------------------------------
create table if not exists public.leads (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.conversations(id) on delete set null,
  name            text not null,
  email           text not null,
  interest        text,
  created_at      timestamptz not null default now()
);

-- Similarity search ----------------------------------------------------------
create or replace function public.match_chunks(
  query_embedding vector(1536),
  match_count     int   default 8,
  min_similarity  float default 0.25
)
returns table (
  id             bigint,
  document_id    uuid,
  document_title text,
  source_type    text,
  file_path      text,
  source_url     text,
  content        text,
  page           int,
  similarity     float
)
language sql stable
as $$
  select c.id, c.document_id, d.title, d.source_type, d.file_path, d.source_url,
         c.content, c.page,
         1 - (c.embedding <=> query_embedding) as similarity
  from public.chunks c
  join public.documents d on d.id = c.document_id
  where 1 - (c.embedding <=> query_embedding) >= min_similarity
  order by c.embedding <=> query_embedding
  limit match_count;
$$;

-- Row level security ---------------------------------------------------------
-- The public chat goes through server routes using the service-role key (which
-- bypasses RLS). Signed-in admins may read/write everything; anonymous users
-- get nothing directly.
alter table public.documents     enable row level security;
alter table public.chunks        enable row level security;
alter table public.conversations enable row level security;
alter table public.messages      enable row level security;
alter table public.leads         enable row level security;

do $$
declare t text;
begin
  foreach t in array array['documents','chunks','conversations','messages','leads'] loop
    execute format('drop policy if exists admin_all on public.%I', t);
    execute format(
      'create policy admin_all on public.%I for all to authenticated using (true) with check (true)', t);
  end loop;
end $$;

-- Storage bucket for uploaded files (private) --------------------------------
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;
