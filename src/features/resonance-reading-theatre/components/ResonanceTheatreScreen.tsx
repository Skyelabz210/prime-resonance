import { useMemo, useState } from "react";
import type { BirthData } from "@/lib/qmnf/chart";
import { computeFullChart } from "@/lib/qmnf/chart";
import { BirthForm } from "@/components/qmnf/BirthForm";
import { generateResonanceSession, DEFAULT_CONFIG } from "../engine/generateResonanceSession";
import { ResonanceCardView } from "./ResonanceCard";

export function ResonanceTheatreScreen() {
  const [birth, setBirth] = useState<BirthData | null>(null);
  const [pinnedBodies, setPinnedBodies] = useState<string[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);

  const session = useMemo(() => {
    if (!birth) return null;
    const chart = computeFullChart(birth);
    return generateResonanceSession(chart, DEFAULT_CONFIG, pinnedBodies);
  }, [birth, pinnedBodies]);

  const cards = session?.cards ?? [];
  const active = cards[activeIdx];

  const onPinActive = () => {
    if (!active) return;
    const names = active.bodies.map((b) => b.name);
    setPinnedBodies((prev) => Array.from(new Set([...prev, ...names])));
  };

  const exportSession = () => {
    if (!session) return;
    const blob = new Blob([JSON.stringify(session, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${session.sessionId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!birth || !session) {
    return (
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-violet-300/80">
            New feature
          </div>
          <h1 className="font-serif text-4xl mt-2 text-white">Resonance Reading Theatre</h1>
          <p className="text-white/60 text-sm mt-3">
            Watch your reading constructed from the actual computed mechanics — every claim
            backed by a math trace. Tap any card to inspect the equations behind the narration.
          </p>
        </div>
        <BirthForm onSubmit={setBirth} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl text-white">Resonance Reading Theatre</h1>
          <div className="text-[11px] font-mono text-white/50 mt-0.5">
            {session.birthDataLabel} · {cards.length} cards · engine {session.engineVersion}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setBirth(null)}
            className="rounded border border-white/15 px-3 py-1.5 text-[11px] font-mono uppercase tracking-widest text-white/70"
          >
            New chart
          </button>
          <button
            onClick={exportSession}
            className="rounded border border-violet-300/40 px-3 py-1.5 text-[11px] font-mono uppercase tracking-widest text-violet-100 bg-violet-500/10"
          >
            Export JSON
          </button>
        </div>
      </header>

      {/* Card stage */}
      {active ? (
        <div
          className="relative mx-auto w-full"
          style={{ maxWidth: 920, height: "min(76vh, 720px)" }}
        >
          <ResonanceCardView
            key={active.id}
            card={active}
            engineVersion={session.engineVersion}
            active
            onPin={onPinActive}
            pinned={active.bodies.some((b) => pinnedBodies.includes(b.name))}
          />
        </div>
      ) : (
        <div className="text-center text-white/60 py-20">
          No cards crossed the confidence threshold.
        </div>
      )}

      {/* Stepper */}
      <div className="flex items-center justify-center gap-3 mt-4">
        <button
          onClick={() => setActiveIdx((i) => Math.max(0, i - 1))}
          disabled={activeIdx === 0}
          className="rounded-full px-4 py-1.5 text-xs font-mono uppercase tracking-widest border border-white/15 text-white/80 disabled:opacity-30"
        >
          ← Prev
        </button>
        <div className="text-xs font-mono text-white/55 tabular-nums">
          {Math.min(activeIdx + 1, cards.length)} / {cards.length}
        </div>
        <button
          onClick={() => setActiveIdx((i) => Math.min(cards.length - 1, i + 1))}
          disabled={activeIdx >= cards.length - 1}
          className="rounded-full px-4 py-1.5 text-xs font-mono uppercase tracking-widest border border-white/15 text-white/80 disabled:opacity-30"
        >
          Next →
        </button>
      </div>

      {/* Card index strip */}
      <div className="flex flex-wrap gap-2 justify-center mt-3">
        {cards.map((c, i) => (
          <button
            key={c.id}
            onClick={() => setActiveIdx(i)}
            className={`rounded px-2 py-1 text-[10px] font-mono uppercase tracking-widest border transition ${
              i === activeIdx
                ? "border-violet-300 text-violet-100 bg-violet-500/20"
                : "border-white/10 text-white/45 hover:text-white/80"
            }`}
            title={c.title}
          >
            {c.eventType.split("_")[0]} · {c.priority.toFixed(2)}
          </button>
        ))}
      </div>

      {/* Diagnostics */}
      <div className="rounded border border-white/10 p-3 bg-black/20 text-[11px] font-mono text-white/55 max-w-3xl mx-auto">
        <div>
          candidates: {session.diagnostics.totalCandidates} · rejected:{" "}
          {session.diagnostics.rejectedLowConfidence} · compute:{" "}
          {session.diagnostics.computeMs}ms · avg confidence:{" "}
          {(session.globalSummary.averageConfidence * 100).toFixed(0)}%
        </div>
        {session.globalSummary.notes.map((n, i) => (
          <div key={i}>· {n}</div>
        ))}
        {session.diagnostics.warnings.map((w, i) => (
          <div key={`w${i}`} className="text-amber-300">
            ⚠ {w}
          </div>
        ))}
        {pinnedBodies.length > 0 && (
          <div className="text-amber-200">
            pinned bodies: {pinnedBodies.join(", ")}{" "}
            <button
              onClick={() => setPinnedBodies([])}
              className="underline ml-2 text-white/60"
            >
              clear
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
