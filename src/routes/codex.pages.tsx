import { createFileRoute } from "@tanstack/react-router";
import { CodexPageWalk } from "@/components/qmnf/CodexPageWalk";

function PagesRoute() {
  return (
    <div className="space-y-6">
      <header className="space-y-2 max-w-3xl">
        <h1 className="font-serif text-3xl" style={{ color: "#e6e8ff" }}>
          Pages 1 – 74 — HULTA/CRAM Decoding
        </h1>
        <p className="text-sm text-white/70 leading-relaxed">
          The Dresden Codex read as a parallel Residue Number System processor. Four phases, one
          closed loop: page 74 resets the state vector, page 1 re-initializes.
        </p>
      </header>
      <CodexPageWalk />
    </div>
  );
}

export const Route = createFileRoute("/codex/pages")({
  head: () => ({ meta: [{ title: "Pages — Prime Resonance Astrology" }] }),
  component: PagesRoute,
});
