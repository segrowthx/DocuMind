export interface RetrievedChunk {
  id: number;
  document_id: string;
  document_title: string;
  source_type: string;
  file_path: string | null;
  source_url: string | null;
  content: string;
  page: number | null;
  similarity: number;
}

/** A numbered source as shown to the model ([n]) and to the user (chip). */
export interface Source {
  n: number;
  documentId: string;
  title: string;
  page: number | null;
  url: string | null; // external URL for web pages; file sources are served via /api/sources
  /** The passage text the answer was built from (trimmed). */
  snippet: string;
  /** Cosine similarity of the passage to the question, 0..1. */
  similarity?: number;
}

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}
