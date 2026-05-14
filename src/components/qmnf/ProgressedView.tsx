import { useMemo, useState } from "react";
import type { FullChart } from "@/lib/qmnf/chart";
import { computeProgressed } from "@/lib/qmnf/progressions";
import { datetimeToJD } from "@/lib/qmnf/julian";
import { formatPosition } from "@/lib/qmnf/format";
import { PLANET_GLYPHS } from "@/lib/qmnf/constants";
import { Rigorous } from "./Rigorous";

function todayIso(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

export function ProgressedView({ chart }: { chart: FullChart }) {
  const [dateStr, setDateStr] = useState(todayIso());
  const targetJd = useMemo(() => {
    const [y, m, d] = dateStr.split("-").map(Number);
    return datetimeToJD(y, m, d, 12, 0, 0, 0);
  }, [dateStr]);

  const prog = useMemo(() => computeProgressed(chart.birth, chart, targetJd), [chart, targetJd]);

  return (
    <div
      className="rounded border p-4 backdrop-blur"
      style={{
        borderColor: "#a8e6cf30",
        background: "linear-gradient(135deg,#1a1f3a40,#a8e6cf08)",
      }}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="font-serif text-xl" style={{ color: "#a8e6cf" }}>
          Secondary Progressions{" "}
          <span className="text-[11px] font-mono text-white/40">(day = year)</span>
        </h2>
        <div className="flex items-center gap-2 text-xs font-mono">
          <label className="text-white/50">Target</label>
          <input
            type="date"
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
            className="rounded border bg-black/30 px-2 py-1 text-white/85"
            style={{ borderColor: "#a8e6cf40" }}
          />
          <span className="text-white/40">age {prog.yearsProgressed.toFixed(1)}</span>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-2">
        {prog.chart.ephemeris.planets.map((p) => {
          const natal = chart.ephemeris.planets.find((x) => x.name === p.name);
          const drift = natal
            ? (Number(p.longitudeArcsec - natal.longitudeArcsec) / 3600).toFixed(2)
            : "—";
          return (
            <div key={p.name} className="rounded bg-black/30 px-3 py-2 text-xs font-mono">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-base">{PLANET_GLYPHS[p.name] || "•"}</span>
                <span className="text-white/85">{p.name}</span>
                <span className="ml-auto text-white/40">Δ {drift}°</span>
              </div>
              <div className="text-white/65">{formatPosition(p.longitudeArcsec)}</div>
              <Rigorous>
                <div className="text-[10px] mt-1">
                  K (winding mod 323) ={" "}
                  <span className="text-emerald-300">{prog.windingK[p.name].toString()}</span>
                </div>
              </Rigorous>
            </div>
          );
        })}
      </div>

      <Rigorous>
        <div className="mt-3 text-[10px] font-mono">
          Progressed JD = natalJD + yearsProgressed. K-Elimination keeps every planet on the same
          gear (mod 323): drift across years is exactly measurable in residue space.
        </div>
      </Rigorous>
    </div>
  );
}
