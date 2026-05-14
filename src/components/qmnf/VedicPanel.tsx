import type { FullChart } from "@/lib/qmnf/chart";
import { PLANET_GLYPHS } from "@/lib/qmnf/constants";
import { Rigorous } from "./Rigorous";

function arcsecToDegMin(arcsec: bigint): string {
  const total = Number(arcsec);
  const deg = Math.floor(total / 3600);
  const min = Math.floor((total - deg * 3600) / 60);
  return `${deg}°${String(min).padStart(2, "0")}'`;
}

export function VedicPanel({ chart }: { chart: FullChart }) {
  const v = chart.vedic;
  return (
    <div
      className="rounded border p-4 backdrop-blur"
      style={{
        borderColor: "#ffd56b30",
        background: "linear-gradient(135deg,#1a1f3a40,#ffd56b08)",
      }}
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-serif text-xl" style={{ color: "#ffd56b" }}>
          Vedic — Sidereal Layer
        </h2>
        <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">
          Lahiri ayanamsa {arcsecToDegMin(v.ayanamsaArcsec)}
        </span>
      </div>

      <div
        className="mb-3 rounded border bg-black/20 px-3 py-2 text-xs"
        style={{ borderColor: "#ffd56b22" }}
      >
        <span className="font-mono text-white/60">Moon nakshatra:</span>{" "}
        <span className="text-white/90 font-serif">
          {v.moonNakshatra.name}{" "}
          <span className="font-mono text-[10px] text-white/50">pada {v.moonNakshatra.pada}</span>
        </span>{" "}
        — <span className="text-yellow-200">{v.moonNakshatra.ruler}</span> dasha lord
      </div>

      <div className="space-y-1">
        {v.planets.map((p) => (
          <div
            key={p.name}
            className="flex items-center justify-between rounded bg-black/20 px-2.5 py-1.5 text-xs font-mono"
          >
            <span className="flex items-center gap-2">
              <span className="text-base">{PLANET_GLYPHS[p.name] || "•"}</span>
              <span className="text-white/80">{p.name}</span>
            </span>
            <span className="text-white/60">
              {p.nakshatra.name} <span className="text-white/40">·{p.nakshatra.pada}</span>
            </span>
          </div>
        ))}
      </div>

      <Rigorous>
        <div className="mt-3 text-[10px] font-mono">
          Sidereal = Tropical − Ayanamsa. 27 nakshatras × 48,000″ = 1,296,000″ (full circle).
          <br />
          Vimsottari Dasha total = 120 yr (2³·3·5 — CRT-native).
        </div>
      </Rigorous>
    </div>
  );
}
