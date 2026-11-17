import { GoogleGenAI } from "@google/genai";
import { env } from "@/lib/env";

let cached: GoogleGenAI | null = null;

export function gemini(): GoogleGenAI {
  if (!cached) cached = new GoogleGenAI({ apiKey: env.geminiKey() });
  return cached;
}

/** One-shot JSON call used by the re-ranker and the eval judge. */
export async function generateJson<T>(system: string, user: string): Promise<T> {
  const res = await gemini().models.generateContent({
    model: env.chatModel(),
    contents: user,
    config: { systemInstruction: system, temperature: 0, responseMimeType: "application/json" },
  });
  return JSON.parse(res.text || "{}") as T;
}
