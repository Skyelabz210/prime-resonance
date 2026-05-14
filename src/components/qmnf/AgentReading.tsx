import { useState } from "react";
import type { ReadingBundle } from "@/lib/qmnf/chart";

export function AgentReading({ bundle }: { bundle: ReadingBundle }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stream = async () => {
    setText("");
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/qmnf/reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bundle }),
      });
      if (!res.ok || !res.body) {
        const t = await res.text();
        throw new Error(t || `Request failed (${res.status})`);
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "",
        done = false;
      while (!done) {
        const r = await reader.read();
        if (r.done) break;
        buf += decoder.decode(r.value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, nl);
          buf = buf.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") {
            done = true;
            break;
          }
          try {
            const parsed = JSON.parse(json);
            const c = parsed.choices?.[0]?.delta?.content;
            if (c) setText((t) => t + c);
          } catch {
            buf = line + "\n" + buf;
            break;
          }
        }
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="rounded-lg border p-5 backdrop-blur"
      style={{
        borderColor: "#9d7bff33",
        background: "linear-gradient(135deg,#1a1f3a40,#9d7bff08)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-serif text-2xl" style={{ color: "#e6e8ff" }}>
          Agent Reading
        </h2>
        <button
          disabled={loading}
          onClick={stream}
          className="px-4 py-2 rounded text-sm font-mono uppercase tracking-widest disabled:opacity-50"
          style={{ background: "linear-gradient(135deg,#9d7bff,#5a3fff)", color: "white" }}
        >
          {loading ? "Streaming…" : text ? "Re-read" : "Verbalize Chart"}
        </button>
      </div>
      {error && (
        <div className="rounded bg-red-500/10 border border-red-500/30 px-3 py-2 text-xs text-red-300 font-mono mb-3">
          {error}
        </div>
      )}
      {text ? (
        <div className="prose prose-invert max-w-none text-white/85 text-sm whitespace-pre-wrap font-serif leading-relaxed">
          {text}
        </div>
      ) : (
        <p className="text-xs text-white/40 italic">
          The agent verbalizes only what the bundle contains — every shadow bond, every Face-of-Zero
          locus, every Maya station — without invention.
        </p>
      )}
    </div>
  );
}
