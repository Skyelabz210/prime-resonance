import type { ConfidenceVector } from "../types/resonanceTypes";

const KEYS: Array<{ key: keyof ConfidenceVector; label: string }> = [
  { key: "ephemeris", label: "Ephemeris" },
  { key: "house", label: "House" },
  { key: "aspect", label: "Aspect" },
  { key: "residue", label: "Residue" },
  { key: "shadow", label: "Shadow" },
  { key: "narration", label: "Narration" },
];

export function ConfidenceVectorPanel({ confidence }: { confidence: ConfidenceVector }) {
  return (
    <div className="rounded border border-white/10 p-3 space-y-2 bg-black/20">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-mono uppercase tracking-widest text-white/50">
          Confidence Vector
        </div>
        <div className="font-mono text-xs text-white/80">
          Σ {(confidence.total * 100).toFixed(0)}%
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        {KEYS.map(({ key, label }) => {
          const v = confidence[key];
          const low = v < 0.7;
          return (
            <div key={key} className="flex items-center justify-between gap-2">
              <span className={`font-mono ${low ? "text-amber-300" : "text-white/70"}`}>
                {label}
              </span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1 rounded bg-white/10 overflow-hidden">
                  <div
                    className="h-full"
                    style={{
                      width: `${Math.round(v * 100)}%`,
                      background: low ? "#f5b25a" : "#9d7bff",
                    }}
                  />
                </div>
                <span className="font-mono tabular-nums text-white/70 text-[11px]">
                  {(v * 100).toFixed(0)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
