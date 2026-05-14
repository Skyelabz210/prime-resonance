import type { ResonanceCard } from "../types/resonanceTypes";
import { MathTracePanel } from "./MathTracePanel";
import { ConfidenceVectorPanel } from "./ConfidenceVectorPanel";

export function ResonanceCardBack({
  card,
  engineVersion,
}: {
  card: ResonanceCard;
  engineVersion: string;
}) {
  return (
    <div className="h-full overflow-y-auto p-5 sm:p-8 text-white">
      <header className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-300/80">
            math trace
          </div>
          <h3 className="font-serif text-xl mt-1">{card.title}</h3>
        </div>
        <div className="text-right text-[10px] font-mono text-white/40">
          engine<br />
          <span className="text-emerald-200">{engineVersion}</span>
        </div>
      </header>
      <div className="grid lg:grid-cols-[1fr_260px] gap-5">
        <MathTracePanel math={card.mathTrace} />
        <div className="space-y-3">
          <ConfidenceVectorPanel confidence={card.confidence} />
          <div className="rounded border border-white/10 p-3 bg-black/20 text-xs space-y-1.5">
            <div className="text-[10px] font-mono uppercase tracking-widest text-white/40">
              Bodies
            </div>
            {card.bodies.map((b) => (
              <div key={b.name} className="font-mono text-white/80">
                <div className="flex justify-between">
                  <span>{b.name}</span>
                  <span className="text-violet-200">{b.longitudeDeg.toFixed(3)}°</span>
                </div>
                <div className="text-[10px] text-white/45 flex justify-between">
                  <span>{b.sign} {b.degreeInSign?.toFixed(2)}°</span>
                  <span>
                    {b.velocityDegPerDay.toFixed(3)}°/d {b.retrograde ? "℞" : ""}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4 text-[10px] font-mono text-white/35 text-center">
        tap card to flip back · resume narration
      </div>
    </div>
  );
}
