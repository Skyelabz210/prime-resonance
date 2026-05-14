import type { ResonanceCard } from "../types/resonanceTypes";
import { DepthPhaseIndicator } from "./DepthPhaseIndicator";
import { KaraokeNarration } from "./KaraokeNarration";
import { AspectGeometryView } from "./AspectGeometryView";
import { HouseDepthArc } from "./HouseDepthArc";
import { ResidueLaneView } from "./ResidueLaneView";
import { ShadowOverlayView } from "./ShadowOverlayView";

export function ResonanceCardFront({
  card,
  highlight,
  elapsedMs,
  currentSegmentIndex,
}: {
  card: ResonanceCard;
  highlight: Set<string>;
  elapsedMs: number;
  currentSegmentIndex: number;
}) {
  return (
    <div className="flex flex-col h-full p-5 sm:p-8 gap-5 text-white">
      <header className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-violet-300/80">
            {card.eventType.replace(/_/g, " ")}
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl mt-1 text-white">{card.title}</h2>
          <div className="text-xs text-white/55 mt-1 font-mono">{card.subtitle}</div>
        </div>
        <div className="text-right text-[10px] font-mono text-white/40">
          priority<br />
          <span className="text-base text-violet-200">{card.priority.toFixed(2)}</span>
        </div>
      </header>

      <div className="flex-1 grid sm:grid-cols-[1fr_280px] gap-5 items-start">
        <div className="space-y-4 order-2 sm:order-1">
          <KaraokeNarration
            track={card.narration}
            currentSegmentIndex={currentSegmentIndex}
            elapsedMs={elapsedMs}
          />
        </div>
        <div className="space-y-4 order-1 sm:order-2">
          {card.aspectContext && (
            <AspectGeometryView aspect={card.aspectContext} highlight={highlight} />
          )}
          {card.houseContext && !card.aspectContext && (
            <HouseDepthArc house={card.houseContext} highlight={highlight} />
          )}
          {card.shadowContext && (
            <ShadowOverlayView shadow={card.shadowContext} highlight={highlight} />
          )}
          {card.residueContext && !card.shadowContext && (
            <ResidueLaneView residue={card.residueContext} highlight={highlight} />
          )}
        </div>
      </div>

      <footer className="space-y-2">
        <DepthPhaseIndicator
          depth={card.intensity}
          icon={card.phaseContext.visualDepthIcon}
          label="Event intensity"
        />
        <div className="text-[10px] font-mono text-white/35 text-center">
          tap card to flip · see math trace · {card.bodies.map((b) => b.name).join(" / ")}
        </div>
      </footer>
    </div>
  );
}
