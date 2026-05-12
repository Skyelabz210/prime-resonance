import type { FullChart } from "@/lib/qmnf/chart";

export function ShadowNetworkPanel({ chart }: { chart: FullChart }) {
  const invisibleKey = new Set(
    chart.invisibleShadowBonds.map(b => b.a < b.b ? `${b.a}|${b.b}` : `${b.b}|${b.a}`),
  );
  const k = (a: string, b: string) => a < b ? `${a}|${b}` : `${b}|${a}`;

  const grouped = new Map<string, typeof chart.shadowNetwork>();
  for (const b of chart.shadowNetwork) {
    if (!grouped.has(b.laneName)) grouped.set(b.laneName, []);
    grouped.get(b.laneName)!.push(b);
  }

  return (
    <div className="rounded-lg border p-4 backdrop-blur"
      style={{ borderColor: "#9d7bff33", background: "#9d7bff08" }}>
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="font-serif text-xl" style={{ color: "#cdb6ff" }}>Shadow Network</h2>
        <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">
          Prime 11 · {chart.shadowNetwork.length} bonds · {chart.invisibleShadowBonds.length} invisible
        </span>
      </div>
      <p className="text-xs text-white/50 mb-3 italic">
        Bonds where r₁₁ matches. Invisible bonds reveal the +60% structure
        no traditional astrology can see.
      </p>
      <div className="space-y-2 max-h-72 overflow-auto">
        {[...grouped.entries()].map(([lane, bonds]) => (
          <div key={lane}>
            <div className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "#9d7bff" }}>
              {lane} · r₁₁={bonds[0].residue}
            </div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {bonds.map((b, i) => (
                <span key={i} className="text-xs font-mono px-2 py-0.5 rounded"
                  style={{
                    background: invisibleKey.has(k(b.a, b.b)) ? "#9d7bff22" : "#ffffff08",
                    color: invisibleKey.has(k(b.a, b.b)) ? "#cdb6ff" : "#e6e8ff",
                    border: invisibleKey.has(k(b.a, b.b)) ? "1px dashed #9d7bff66" : "1px solid transparent",
                  }}>
                  {b.a}–{b.b}
                </span>
              ))}
            </div>
          </div>
        ))}
        {chart.shadowNetwork.length === 0 && (
          <div className="text-xs text-white/40 italic py-3">No shadow bonds.</div>
        )}
      </div>
    </div>
  );
}
