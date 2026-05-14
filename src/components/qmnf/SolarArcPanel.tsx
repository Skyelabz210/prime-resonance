// Solar Arc directions panel — every natal position advanced by the
// Naibod arc (0.9856°/yr). At any chosen age, all aspects from directed
// to natal points are first-class predictive events.

import { useMemo, useState } from "react";
import type { FullChart } from "@/lib/qmnf/chart";
import { solarArcAdvance } from "@/lib/qmnf/solararc";
import { classifyPair } from "@/lib/qmnf/aspects";
import { formatPosition } from "@/lib/qmnf/format";
import { Rigorous } from "./Rigorous";

const SIGNS = ["Ari", "Tau", "Gem", "Can", "Leo", "Vir", "Lib", "Sco", "Sag", "Cap", "Aqu", "Pis"];

export function SolarArcPanel({ chart }: { chart: FullChart }) {
  const [age, setAge] = useState(30);
  const directed = useMemo(() => solarArcAdvance(chart.jd, age), [chart, age]);

  // Hits: aspects from directed planets to natal planets.
  const hits = useMemo(() => {
    const out: Array<{ d: string; n: string; aspect: string; orbDeg: number }> = [];
    for (const d of directed.planets) {
      for (const n of chart.ephemeris.planets) {
        const matches = classifyPair({ ...d, name: `d.${d.name}` }, { ...n, name: `n.${n.name}` });
        for (const m of matches) {
          if (m.aspect.family === "cardinal" || m.aspect.family === "classical") {
            const orbDeg = Number(m.orbDeltaArcsec) / 3600;
            if (orbDeg < 1) {
              out.push({ d: d.name, n: n.name, aspect: m.aspect.name, orbDeg });
            }
          }
        }
      }
    }
    return out.sort((a, b) => a.orbDeg - b.orbDeg);
  }, [directed, chart]);

  return (
    <div
      className="rounded border p-4 backdrop-blur"
      style={{ borderColor: "#ffb34730", background: "#ffb34708" }}
    >
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="font-serif text-xl text-white/85">Solar Arc Directions</h2>
        <div className="flex items-center gap-2 text-xs font-mono">
          <label className="text-white/50">Age</label>
          <input
            type="number"
            min={0}
            max={120}
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            className="w-16 rounded border bg-black/30 px-2 py-1 text-white/85"
            style={{ borderColor: "#ffb34740" }}
          />
          <span className="text-white/45">
            arc {(Number(directed.arcArcsec) / 3600).toFixed(2)}°
          </span>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-white/40 font-mono mb-1">
            Directed positions
          </div>
          <div className="space-y-0.5 text-xs font-mono">
            {directed.planets.slice(0, 10).map((p) => {
              const deg = Number(p.longitudeArcsec) / 3600;
              return (
                <div key={p.name} className="flex gap-3">
                  <span className="text-white/55 w-20">{p.name}</span>
                  <span className="text-white/85">
                    {formatPosition(p.longitudeArcsec)} {SIGNS[Math.floor(deg / 30)]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-widest text-white/40 font-mono mb-1">
            Hits at age {age} (orb &lt; 1°)
          </div>
          <div className="space-y-0.5 text-xs font-mono max-h-48 overflow-y-auto">
            {hits.length === 0 && <div className="text-white/40">none</div>}
            {hits.map((h, i) => (
              <div key={i} className="flex gap-3">
                <span className="text-amber-200 w-44">
                  d.{h.d} → n.{h.n}
                </span>
                <span className="text-white/55">{h.aspect}</span>
                <span className="text-white/40">orb {h.orbDeg.toFixed(2)}°</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Rigorous>
        <div className="mt-3 text-[10px] font-mono text-violet-300/80">
          Naibod arc = Sun's mean motion = 3548″/day → 0.9856°/yr. Every natal point advances by the
          same integer-arcsec arc — preserves residues mod 2, mod 3, ... (CRT-homomorphic). Lane-11
          residues all shift by the same constant, so shadow bonds are invariant under solar arc.
        </div>
      </Rigorous>
    </div>
  );
}
