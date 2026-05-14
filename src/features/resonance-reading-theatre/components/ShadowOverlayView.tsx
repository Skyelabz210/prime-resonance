import type { ShadowContactContext } from "../types/resonanceTypes";

export function ShadowOverlayView({
  shadow,
}: {
  shadow: ShadowContactContext;
  highlight: Set<string>;
}) {
  return (
    <div className="rounded border border-violet-400/30 p-4 bg-gradient-to-br from-violet-500/10 to-transparent text-center">
      <div className="text-[10px] font-mono uppercase tracking-widest text-violet-300">
        {shadow.contactType.replace(/_/g, " ")}
      </div>
      <div className="mt-2 font-serif text-xl text-white/90">
        {shadow.bodies.join(" ⟿ ")}
      </div>
      <div className="mt-3 text-xs text-white/70">{shadow.explanation}</div>
      <div className="mt-3 grid grid-cols-2 gap-3 text-[11px] font-mono">
        <div>
          <div className="text-white/40">deviation</div>
          <div className="text-white/85">{shadow.deviationDeg.toFixed(3)}°</div>
        </div>
        <div>
          <div className="text-white/40">strength</div>
          <div className="text-violet-200">{(shadow.normalizedStrength * 100).toFixed(0)}%</div>
        </div>
      </div>
    </div>
  );
}
