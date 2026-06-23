import { useState } from "react";
import { streamChat } from "../lib/client";

export function AisleCopilot({ memberId }: { memberId?: string }) {
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [input, setInput] = useState("");

  async function send() {
    const text = input.trim();
    if (!text) return;
    setInput("");
    setMessages((m) => [...m, { role: 'user', text }]);
    let reply = '';
    for await (const token of streamChat(text, memberId)) {
      reply += token;
      setMessages((m) => upsertAssistant(m, reply));
    }
  }

  return (
    <section className="copilot" role="log" aria-live="polite">
      {messages.map((m, i) => (
        <div key={i} className={m.role}>{m.text}</div>
      ))}
      <form onSubmit={(e) => { e.preventDefault(); send(); }}>
        <input value={input} onChange={(e) => setInput(e.target.value)}
          aria-label="Ask Aisle Copilot" placeholder="Ask about products, sizes, pickup…" />
      </form>
    </section>
  );
}