import { Chat } from "@/components/Chat";

export const metadata = { title: "Brightpath Training assistant" };

/** Bare chat used inside the embeddable widget iframe. */
export default function ChatEmbedPage() {
  return (
    <main className="h-dvh bg-sheet">
      <Chat variant="compact" embed />
    </main>
  );
}
