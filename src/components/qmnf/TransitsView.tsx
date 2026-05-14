import { useMemo, useState } from "react";
import type { FullChart } from "@/lib/qmnf/chart";
import { computeTransits } from "@/lib/qmnf/transits";
import { datetimeToJD } from "@/lib/qmnf/julian";
import { Rigorous } from "./Rigorous";

function todayIso(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

export function TransitsView({ chart }: { chart: FullChart }) {
  const [dateStr, setDateStr] = useState(todayIso());
  const jd = useMemo(() => {
    const [y, m, d] = dateStr.split("-").map(Number);
    return datetimeToJD(y, m, d, 12, 0, 0, 0);
  }, [dateStr]);
  const transit = useMemo(() => computeTransits(chart, jd), [chart, jd]);

  const hits = transit.hits
    .filter((h) => h.aspect.aspect.family === "cardinal" || h.aspect.aspect.family === "classical")
    .sort((a, b) => Number(a.aspect.orbDeltaArcsec) - Number(b.aspect.orbDeltaArcsec));

  return (
    <div className="space-y-6">
      <div
        className="rounded border p-4 backdrop-blur"
        style={{
          borderColor: "#5dd6c430",
          background: "linear-gradient(135deg,#1a1f3a40,#5dd6c408)",
        }}
      >
        <div className="flex items-center justify-between gap-3 mb-3">
          <h2 className="font-serif text-xl" style={{ color: "#5dd6c4" }}>
            Transits
          </h2>
          <input
            type="date"
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
            className="rounded border bg-black/30 px-2 py-1 text-sm font-mono text-white/85"
            style={{ borderColor: "#5dd6c440" }}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="text-white/40 border-b border-white/10">
                <th className="text-left py-1.5">Transit</th>
                <th className="text-left">Natal</th>
                <th className="text-left">Aspect</th>
                <th className="text-right">Orb</th>
                <th className="text-left pl-3">Shadow?</th>
              </tr>
            </thead>
            <tbody>
              {hits.slice(0, 30).map((h, i) => {
                const isShadow = transit.shadowCrossLocks.some(
                  (s) => s.a.endsWith(h.transit) && s.b.endsWith(h.natal),
                );
                return (
                  <tr key={i} className="border-b border-white/5">
                    <td className="py-1.5 text-white/85">{h.transit}</td>
                    <td className="text-white/70">→ {h.natal}</td>
                    <td className="text-white/85">
                      {h.aspect.aspect.symbol} {h.aspect.aspect.name}
                    </td>
                    <td className="text-right text-white/60">
                      {(Number(h.aspect.orbDeltaArcsec) / 3600).toFixed(2)}°
                    </td>
                    <td className="pl-3">
                      {isShadow ? (
                        <span style={{ color: "#9d7bff" }}>lane-11</span>
                      ) : (
                        <span className="text-white/30">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
          <div className="rounded bg-black/30 px-3 py-2">
            <div className="text-[10px] uppercase tracking-widest text-white/40">
              Shadow cross-locks
            </div>
            <div className="text-2xl font-mono" style={{ color: "#9d7bff" }}>
              {transit.shadowCrossLocks.length}
            </div>
          </div>
          <div className="rounded bg-black/30 px-3 py-2">
            <div className="text-[10px] uppercase tracking-widest text-white/40">
              Boundary cross-locks
            </div>
            <div className="text-2xl font-mono" style={{ color: "#ffb347" }}>
              {transit.boundaryCrossLocks.length}
            </div>
          </div>
        </div>

        <Rigorous>
          <div className="mt-3 text-[10px] font-mono">
            A transit fires the lane-11 shadow flag when transit_r₁₁ ≡ natal_r₁₁ (mod 11). This is
            the canonical "shadow activation" — independent of any angular orb.
          </div>
        </Rigorous>
      </div>
    </div>
  );
}
