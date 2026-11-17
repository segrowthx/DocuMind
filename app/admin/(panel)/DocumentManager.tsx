"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export interface DocRow {
  id: string;
  title: string;
  sourceType: string;
  sourceUrl: string | null;
  createdAt: string;
  chunks: number;
}

const TYPE_LABEL: Record<string, string> = { pdf: "PDF", docx: "Word", url: "Web page", text: "Text" };

export function DocumentManager({ docs }: { docs: DocRow[] }) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<{ kind: "busy" | "ok" | "error"; text: string } | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  async function upload(form: FormData, label: string) {
    setStatus({ kind: "busy", text: `Adding ${label}… this can take a few seconds.` });
    const res = await fetch("/api/admin/documents", { method: "POST", body: form }).catch(() => null);
    const data = await res?.json().catch(() => null);
    if (!res?.ok) {
      setStatus({ kind: "error", text: data?.error ?? "Upload failed. Check your connection and try again." });
      return;
    }
    setStatus({ kind: "ok", text: `Added “${data.title}” as ${data.chunks} searchable chunks.` });
    router.refresh();
  }

  async function addFiles(files: FileList | null) {
    if (!files?.length) return;
    for (const file of Array.from(files)) {
      const form = new FormData();
      form.append("file", file);
      await upload(form, file.name);
    }
    if (fileInput.current) fileInput.current.value = "";
  }

  async function addUrl(e: React.FormEvent) {
    e.preventDefault();
    const form = new FormData();
    form.append("url", url);
    await upload(form, url);
    setUrl("");
  }

  async function remove(id: string) {
    setConfirmId(null);
    setStatus({ kind: "busy", text: "Deleting…" });
    const res = await fetch(`/api/admin/documents/${id}`, { method: "DELETE" }).catch(() => null);
    if (!res?.ok) {
      setStatus({ kind: "error", text: "The document wasn't deleted. Try again." });
      return;
    }
    setStatus({ kind: "ok", text: "Document deleted. The assistant no longer uses it." });
    router.refresh();
  }

  return (
    <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="overflow-x-auto rounded-xl border border-rule bg-sheet">
        {docs.length === 0 ? (
          <p className="p-6 text-slate">No documents yet. Upload a PDF or Word file to give the assistant something to answer from.</p>
        ) : (
          <table className="w-full min-w-[520px] text-left text-[15px]">
            <thead className="border-b border-rule text-sm text-slate">
              <tr>
                <th className="px-4 py-2.5 font-medium">Title</th>
                <th className="px-4 py-2.5 font-medium">Type</th>
                <th className="px-4 py-2.5 text-right font-medium">Chunks</th>
                <th className="px-4 py-2.5 font-medium">Added</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {docs.map((d) => (
                <tr key={d.id} className="border-b border-rule last:border-0">
                  <td className="px-4 py-3 font-medium">
                    <a href={d.sourceUrl ?? `/api/sources/${d.id}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {d.title}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-slate">{TYPE_LABEL[d.sourceType] ?? d.sourceType}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{d.chunks}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate">
                    {new Date(d.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {confirmId === d.id ? (
                      <span className="inline-flex gap-3 text-sm">
                        <button onClick={() => remove(d.id)} className="font-medium text-danger">
                          Delete
                        </button>
                        <button onClick={() => setConfirmId(null)} className="text-slate">
                          Keep
                        </button>
                      </span>
                    ) : (
                      <button onClick={() => setConfirmId(d.id)} className="text-sm text-slate hover:text-danger">
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <aside className="flex flex-col gap-5">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            addFiles(e.dataTransfer.files);
          }}
          className={`rounded-xl border-2 border-dashed p-5 text-center ${dragging ? "border-ink bg-highlight-soft" : "border-rule bg-sheet"}`}
        >
          <p className="font-medium">Drop PDF or Word files here</p>
          <p className="mt-1 text-sm text-slate">Up to 4 MB each. TXT and Markdown also work.</p>
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="mt-4 rounded-md bg-ink px-3.5 py-2 text-sm font-medium text-white"
          >
            Choose files
          </button>
          <input
            ref={fileInput}
            type="file"
            multiple
            accept=".pdf,.docx,.txt,.md"
            className="sr-only"
            onChange={(e) => addFiles(e.target.files)}
          />
        </div>

        <form onSubmit={addUrl} className="rounded-xl border border-rule bg-sheet p-5">
          <label className="block font-medium" htmlFor="url">
            Add a web page
          </label>
          <input
            id="url"
            type="url"
            required
            placeholder="https://example.com/faq"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="mt-2 w-full rounded-md border border-rule px-3 py-2 text-[15px] outline-none focus:border-ink"
          />
          <button className="mt-3 rounded-md border border-ink px-3.5 py-2 text-sm font-medium">Add page</button>
        </form>

        {status && (
          <p
            role="status"
            className={`rounded-lg px-3 py-2.5 text-sm ${
              status.kind === "error" ? "bg-red-50 text-danger" : status.kind === "ok" ? "bg-highlight-soft" : "bg-paper text-slate"
            }`}
          >
            {status.text}
          </p>
        )}
      </aside>
    </div>
  );
}
