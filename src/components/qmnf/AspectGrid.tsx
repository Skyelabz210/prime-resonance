import type { FullChart } from "@/lib/qmnf/chart";
import { useState } from "react";

export function AspectGrid({ chart }: { chart: FullChart }) {
  const [filter, setFilter] = useState<string>("all");
  const filtered = chart.aspects.filter(a => {
    if (filter === "all") return true;
    if (filter === "shadow") return a.aspect.family === "undecile" || a.aspect.shadowOnly;
    if (filter === "boundary") return a.aspect.family === "tredecile";
    return a.aspect.family === filter;
  });

  return (
    <div className="rounded-lg border border-white/10 bg-black/30 p-4 backdrop-blur">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h2 className="font-serif text-xl text-white/80">Aspects</h2>
        <select className="bg-black/40 border border-white/10 rounded text-xs font-mono px-2 py-1 text-white/70"
          value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All ({chart.aspects.length})</option>
          <option value="cardinal">Cardinal</option>
          <option value="classical">Classical</option>
          <option value="minor">Minor</option>
          <option value="quintile">Quintile</option>
          <option value="septile">Septile</option>
          <option value="shadow">Shadow (11)</option>
          <option value="boundary">Boundary (13)</option>
        </select>
      </div>
      <div className="max-h-80 overflow-auto">
        <table className="w-full text-xs font-mono">
          <thead className="text-[10px] uppercase tracking-widest text-white/40">
            <tr>
              <th className="text-left py-1">Pair</th>
              <th className="text-left">Aspect</th>
              <th className="text-right">Orb</th>
              <th className="text-right">c₇,c₁₁,c₁₃</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a, i) => (
              <tr key={i} className="border-t border-white/5">
                <td className="py-1 text-white/80">{a.a} · {a.b}</td>
                <td>
                  <span style={{ color: a.aspect.shadowOnly ? "#9d7bff" : "#5dd6c4" }}>
                    {a.aspect.symbol} {a.aspect.name}
                  </span>
                </td>
                <td className="text-right text-white/60">{(Number(a.orbDeltaArcsec)/3600).toFixed(2)}°</td>
                <td className="text-right text-white/40">{a.carry.join(",")}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={4} className="py-4 text-center text-white/30">no aspects in filter</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
