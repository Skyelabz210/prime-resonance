import type { PhaseContext } from "../types/resonanceTypes";

const ICONS: Record<PhaseContext["visualDepthIcon"], string> = {
  new: "○",
  crescent: "☽",
  quarter: "◐",
  gibbous: "◕",
  full: "●",
  waning: "◑",
};

export function DepthPhaseIndicator({
  depth,
  icon,
  label,
}: {
  depth: number;
  icon: PhaseContext["visualDepthIcon"];
  label?: string;
}) {
  const pct = Math.round(depth * 100);
  return (
    <div className="flex items-center gap-3">
      <div
        className="text-3xl"
        style={{
          color: "#9d7bff",
          textShadow: `0 0 ${4 + depth * 18}px rgba(157,123,255,${0.4 + depth * 0.5})`,
        }}
        aria-label={`Depth ${pct}%`}
      >
        {ICONS[icon]}
      </div>
      <div className="flex-1">
        <div className="text-[10px] font-mono uppercase tracking-widest text-white/50">
          {label ?? "Intensity"}
        </div>
        <div className="h-1.5 rounded bg-white/10 overflow-hidden mt-1">
          <div
            className="h-full"
            style={{
              width: `${pct}%`,
              background: "linear-gradient(90deg,#9d7bff,#5a3fff)",
              transition: "width 240ms ease",
            }}
          />
        </div>
      </div>
      <div className="font-mono text-xs text-white/70 tabular-nums">{pct}%</div>
    </div>
  );
}
