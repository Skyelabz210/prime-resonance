import type { NarrationTrack } from "../types/resonanceTypes";

export function KaraokeNarration({
  track,
  currentSegmentIndex,
  elapsedMs,
}: {
  track: NarrationTrack;
  currentSegmentIndex: number;
  elapsedMs: number;
}) {
  return (
    <div className="space-y-1.5 text-left">
      {track.segments.map((seg, i) => {
        const isCurrent = i === currentSegmentIndex;
        const isPast = elapsedMs >= seg.endMs;
        return (
          <p
            key={seg.id}
            className={`font-serif text-base leading-relaxed transition-all duration-200 ${
              isCurrent
                ? "text-white scale-[1.01]"
                : isPast
                  ? "text-white/45"
                  : "text-white/30"
            }`}
            style={{
              textShadow: isCurrent ? "0 0 14px rgba(157,123,255,0.45)" : "none",
            }}
          >
            {seg.text}
          </p>
        );
      })}
    </div>
  );
}
