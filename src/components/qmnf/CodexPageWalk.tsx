import {
  CODEX_PAGES,
  PHASE_DESCRIPTIONS,
  CONTINUITY_HYPOTHESIS,
  type Phase,
} from "@/lib/qmnf/codex_pages";

const PHASE_COLOR: Record<Phase, string> = {
  Biological: "#a8e6cf",
  MarsAgricultural: "#ff9aa2",
  Astronomical: "#9d7bff",
  Prophetic: "#ffd56b",
};

const CARRY_LABEL: Record<string, string> = {
  black: "steady (black glyphs)",
  "red-rare": "minor K-Elim (red sparse)",
  "red-frequent": "intense K-Elim (red frequent)",
  "red-black-alternating": "MRC ALU (red↔black)",
  reset: "system reset",
};

function StateVector({ s }: { s: (number | null)[] }) {
  const labels = ["r₂", "r₃", "r₅", "r₇", "r₁₁", "r₁₃"];
  return (
    <div className="flex gap-1 font-mono text-[10px]">
      {s.map((v, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-0.5 rounded bg-black/30 px-1.5 py-0.5"
        >
          <span className="text-white/40">{labels[i]}</span>
          <span style={{ color: v === 0 ? "#5dd6c4" : v === null ? "#9d7bff" : "#cfd6ff" }}>
            {v === null ? "drift" : v}
          </span>
        </span>
      ))}
    </div>
  );
}

export function CodexPageWalk() {
  return (
    <div className="space-y-6">
      <div
        className="rounded border p-4"
        style={{
          borderColor: "#9d7bff44",
          background: "linear-gradient(135deg,#1a1f3a60,#9d7bff10)",
        }}
      >
        <h2 className="font-serif text-xl mb-2" style={{ color: "#cfd6ff" }}>
          The Codex as a Closed-Loop Program
        </h2>
        <p className="text-sm text-white/75 leading-relaxed whitespace-pre-line">
          {CONTINUITY_HYPOTHESIS}
        </p>
      </div>

      {(["Biological", "MarsAgricultural", "Astronomical", "Prophetic"] as Phase[]).map((phase) => (
        <section key={phase}>
          <h3 className="font-serif text-lg mb-1" style={{ color: PHASE_COLOR[phase] }}>
            Phase: {phase.replace("MarsAgricultural", "Mars / Agricultural")}
          </h3>
          <p className="text-xs text-white/55 mb-3 font-mono leading-relaxed">
            {PHASE_DESCRIPTIONS[phase]}
          </p>
          <div className="space-y-2">
            {CODEX_PAGES.filter((p) => p.phase === phase).map((p, i) => (
              <div
                key={i}
                className="rounded border bg-black/25 px-4 py-3"
                style={{ borderColor: `${PHASE_COLOR[phase]}33` }}
              >
                <div className="flex items-baseline justify-between mb-1.5">
                  <h4 className="font-serif text-base text-white/90">
                    <span className="font-mono text-xs text-white/40 mr-2">
                      P{p.start === p.end ? p.start : `${p.start}–${p.end}`}
                    </span>
                    {p.title}
                  </h4>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">
                    {CARRY_LABEL[p.carry] ?? p.carry}
                  </span>
                </div>
                <p className="text-[11px] text-white/55 italic mb-2">{p.motif}</p>
                <StateVector s={p.state} />
                <p className="mt-2 text-[11px] font-mono text-white/70">{p.identity}</p>
              </div>
            ))}
          </div>
        </section>
      ))}

      <div
        className="rounded border p-4 text-center"
        style={{ borderColor: "#5dd6c455", background: "#5dd6c410" }}
      >
        <p className="text-sm text-white/85 italic">
          ↻ Page 74 resets all lanes to 0. Page 1 re-initializes. The Codex loops.
        </p>
      </div>
    </div>
  );
}
