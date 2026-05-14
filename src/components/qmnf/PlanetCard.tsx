import type { PlanetPosition } from "@/lib/qmnf/ephemeris";
import { PLANET_GLYPHS } from "@/lib/qmnf/constants";
import { formatPosition } from "@/lib/qmnf/format";
import { useRigor } from "@/lib/qmnf/rigor";

function Chip({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-mono"
      style={{ background: "#ffffff08", color: color || "#e6e8ff" }}
    >
      <span className="text-white/40">{label}</span>
      <span>{value}</span>
    </span>
  );
}

export function PlanetCard({ planet, house }: { planet: PlanetPosition; house: number }) {
  const a = planet.address;
  const { mode } = useRigor();
  const rigorous = mode === "rigorous";
  return (
    <div className="rounded border border-white/10 bg-black/30 px-3 py-2 backdrop-blur">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-lg" style={{ color: "#e6e8ff" }}>
            {PLANET_GLYPHS[planet.name] || "•"}
          </span>
          <span className="font-serif text-sm text-white/90">{planet.name}</span>
          {planet.retrograde && <span className="text-[10px] text-pink-400 font-mono">℞</span>}
        </div>
        <div className="text-[10px] font-mono text-white/40">H{house}</div>
      </div>
      <div className="text-xs font-mono text-white/70 mb-1.5">
        {formatPosition(planet.longitudeArcsec)}
      </div>
      <div className="mt-1 text-[10px] font-mono text-white/40">
        Lane: <span style={{ color: "#9d7bff" }}>{a.shadowLane()}</span>
        {" · "}
        <span style={{ color: "#ffb347" }}>{a.boundaryLane()}</span>
      </div>
      {rigorous && (
        <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-white/5">
          <Chip label="r₂" value={a.r2.toString()} />
          <Chip label="r₃" value={a.r3.toString()} />
          <Chip label="r₅" value={a.r5.toString()} />
          <Chip label="r₇" value={a.r7.toString()} color="#ffd56b" />
          <Chip label="r₁₁" value={a.r11.toString()} color="#9d7bff" />
          <Chip label="r₁₃" value={a.r13.toString()} color="#ffb347" />
          <Chip label="K" value={a.gearK.toString()} color="#5dd6c4" />
        </div>
      )}
    </div>
  );
}
