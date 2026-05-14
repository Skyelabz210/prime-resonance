// Harmonics panel — Addey's n-th harmonic chart with surfaced
// conjunctions. The 5th harmonic surfaces quintile structure (creative
// talent), the 7th surfaces septile (purpose/fate), the 9th nonile
// (completion), the 11th — exactly the shadow harmonic — surfaces lane-11
// bonds as conjunctions.

import { useMemo, useState } from "react";
import type { FullChart } from "@/lib/qmnf/chart";
import { harmonicFromChart, type HarmonicChart } from "@/lib/qmnf/harmonics";
import { formatPosition } from "@/lib/qmnf/format";
import { Rigorous } from "./Rigorous";

const HARMONICS: Array<{ n: number; label: string; meaning: string }> = [
  { n: 5, label: "5th", meaning: "Quintile — creative talent" },
  { n: 7, label: "7th", meaning: "Septile — purpose, fate" },
  { n: 9, label: "9th", meaning: "Nonile — completion" },
  { n: 11, label: "11th", meaning: "Shadow harmonic — lane-11 bonds as conjunctions" },
];

export function HarmonicsPanel({ chart }: { chart: FullChart }) {
  const [n, setN] = useState(5);
  const harmonic: HarmonicChart = useMemo(() => harmonicFromChart(chart.ephemeris, n), [chart, n]);
  const surfaced = harmonic.aspects.filter(
    (a) => a.aspect.name === "Conjunction" && Number(a.orbDeltaArcsec) / 3600 < 5,
  );

  return (
    <div
      className="rounded border p-4 backdrop-blur"
      style={{ borderColor: "#9d7bff30", background: "#9d7bff08" }}
    >
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="font-serif text-xl text-white/85">Harmonic Charts</h2>
        <div className="flex gap-2 font-mono text-xs">
          {HARMONICS.map((h) => (
            <button
              key={h.n}
              onClick={() => setN(h.n)}
              className="rounded border px-2 py-1"
              style={{
                borderColor: n === h.n ? "#9d7bff" : "#9d7bff40",
                background: n === h.n ? "#9d7bff22" : "transparent",
                color: n === h.n ? "#cfd6ff" : "#cfd6ff99",
              }}
            >
              {h.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3 text-xs text-white/55">{HARMONICS.find((h) => h.n === n)?.meaning}</div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-white/40 font-mono mb-1">
            {n}× positions (mod 360°)
          </div>
          <div className="space-y-0.5 text-xs font-mono">
            {harmonic.planets.slice(0, 10).map((p) => (
              <div key={p.name} className="flex gap-3">
                <span className="text-white/55 w-20">{p.name}</span>
                <span className="text-white/85">{formatPosition(p.longitudeArcsec)}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-widest text-white/40 font-mono mb-1">
            Surfaced conjunctions (orb &lt; 5°)
          </div>
          <div className="space-y-0.5 text-xs font-mono max-h-48 overflow-y-auto">
            {surfaced.length === 0 && <div className="text-white/40">none</div>}
            {surfaced.map((a, i) => (
              <div key={i} className="flex gap-3">
                <span className="text-amber-200 w-44">
                  {a.a} – {a.b}
                </span>
                <span className="text-white/55">
                  orb {(Number(a.orbDeltaArcsec) / 3600).toFixed(2)}°
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Rigorous>
        <div className="mt-3 text-[10px] font-mono text-violet-300/80">
          λ_h = (n · λ) mod 360°. The {n}th harmonic chart compresses {n}-fold angular structure
          into 1-fold (conjunctions). For n = 11 this is identical to the lane-11 (shadow) bond
          detection — same residue, two interpretations.
        </div>
      </Rigorous>
    </div>
  );
}
