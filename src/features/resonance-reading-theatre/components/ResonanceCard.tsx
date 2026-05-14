import { useState, useEffect } from "react";
import type { ResonanceCard } from "../types/resonanceTypes";
import { ResonanceCardFront } from "./ResonanceCardFront";
import { ResonanceCardBack } from "./ResonanceCardBack";
import { useKaraoke } from "./useKaraoke";

export function ResonanceCardView({
  card,
  engineVersion,
  active,
  onPin,
  pinned,
}: {
  card: ResonanceCard;
  engineVersion: string;
  active: boolean;
  onPin?: () => void;
  pinned?: boolean;
}) {
  const [flipped, setFlipped] = useState(false);
  const { state, play, pause, replay } = useKaraoke(card.narration, active);

  // Tap to flip pauses narration
  const handleFlip = () => {
    if (!flipped && state.playing) pause();
    setFlipped((f) => !f);
  };

  // Re-mount per active card resets state
  useEffect(() => {
    setFlipped(false);
  }, [card.id]);

  return (
    <div className="relative w-full h-full" style={{ perspective: 1400 }}>
      <div
        className="relative w-full h-full transition-transform duration-700"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* FRONT */}
        <button
          type="button"
          onClick={handleFlip}
          className="absolute inset-0 w-full h-full text-left rounded-2xl overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            background:
              "linear-gradient(160deg, rgba(26,31,58,0.95) 0%, rgba(10,14,26,0.98) 60%, rgba(20,15,40,0.95) 100%)",
            border: "1px solid rgba(157,123,255,0.25)",
            boxShadow: "0 25px 60px -20px rgba(157,123,255,0.35)",
          }}
        >
          <ResonanceCardFront
            card={card}
            highlight={state.highlightTargets}
            elapsedMs={state.elapsedMs}
            currentSegmentIndex={state.currentSegmentIndex}
          />
        </button>
        {/* BACK */}
        <button
          type="button"
          onClick={handleFlip}
          className="absolute inset-0 w-full h-full text-left rounded-2xl overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background:
              "linear-gradient(160deg, rgba(8,16,12,0.97), rgba(6,14,20,0.98) 70%)",
            border: "1px solid rgba(110,231,183,0.25)",
            boxShadow: "0 25px 60px -20px rgba(110,231,183,0.25)",
          }}
        >
          <ResonanceCardBack card={card} engineVersion={engineVersion} />
        </button>
      </div>

      {/* Controls (overlay, do not flip when clicked) */}
      <div
        className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {!flipped && (
          <>
            <button
              onClick={state.playing ? pause : play}
              className="rounded-full px-4 py-1.5 text-xs font-mono uppercase tracking-widest border border-violet-300/40 text-white bg-violet-500/20 backdrop-blur"
            >
              {state.playing ? "Pause" : "Play"}
            </button>
            <button
              onClick={replay}
              className="rounded-full px-3 py-1.5 text-xs font-mono uppercase tracking-widest border border-white/20 text-white/80 bg-black/30 backdrop-blur"
            >
              Replay
            </button>
            {onPin && (
              <button
                onClick={onPin}
                className="rounded-full px-3 py-1.5 text-xs font-mono uppercase tracking-widest border border-amber-300/40 text-amber-200 bg-amber-500/10 backdrop-blur"
              >
                {pinned ? "Pinned" : "Pin"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
