import type { FullChart } from "@/lib/qmnf/chart";

export function PatternsPanel({ chart }: { chart: FullChart }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/30 p-4 backdrop-blur">
      <h2 className="font-serif text-xl text-white/80 mb-3">Aspect Patterns</h2>
      <div className="space-y-2 max-h-72 overflow-auto">
        {chart.patterns.map((p, i) => (
          <div key={i} className="rounded bg-white/5 px-3 py-2">
            <div className="text-[10px] font-mono uppercase tracking-widest text-white/40">{p.type}</div>
            <div className="text-sm font-mono text-white/80">{p.planets.join(" · ")}</div>
          </div>
        ))}
        {chart.patterns.length === 0 && (
          <div className="text-xs text-white/40 italic py-3">No major patterns detected.</div>
        )}
      </div>
    </div>
  );
}
