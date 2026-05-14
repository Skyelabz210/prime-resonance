import type { FullChart } from "@/lib/qmnf/chart";

export function BoundaryNetworkPanel({ chart }: { chart: FullChart }) {
  const grouped = new Map<string, typeof chart.boundaryNetwork>();
  for (const b of chart.boundaryNetwork) {
    if (!grouped.has(b.laneName)) grouped.set(b.laneName, []);
    grouped.get(b.laneName)!.push(b);
  }
  return (
    <div
      className="rounded-lg border p-4 backdrop-blur"
      style={{ borderColor: "#ffb34733", background: "#ffb34708" }}
    >
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="font-serif text-xl" style={{ color: "#ffd9a3" }}>
          Boundary Network
        </h2>
        <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">
          Prime 13 · {chart.boundaryNetwork.length} bonds
        </span>
      </div>
      <p className="text-xs text-white/50 mb-3 italic">
        Bonds where r₁₃ matches. The boundary prime sets thresholds the chart cannot cross.
      </p>
      <div className="space-y-2 max-h-72 overflow-auto">
        {[...grouped.entries()].map(([lane, bonds]) => (
          <div key={lane}>
            <div
              className="text-[10px] font-mono uppercase tracking-widest"
              style={{ color: "#ffb347" }}
            >
              {lane} · r₁₃={bonds[0].residue}
            </div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {bonds.map((b, i) => (
                <span
                  key={i}
                  className="text-xs font-mono px-2 py-0.5 rounded"
                  style={{ background: "#ffffff08", color: "#ffd9a3" }}
                >
                  {b.a}–{b.b}
                </span>
              ))}
            </div>
          </div>
        ))}
        {chart.boundaryNetwork.length === 0 && (
          <div className="text-xs text-white/40 italic py-3">No boundary bonds.</div>
        )}
      </div>
    </div>
  );
}
