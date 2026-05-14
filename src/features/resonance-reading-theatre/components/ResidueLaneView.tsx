import type { ResidueContext } from "../types/resonanceTypes";

export function ResidueLaneView({
  residue,
  highlight,
}: {
  residue: ResidueContext;
  highlight: Set<string>;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {residue.modulusSet.map((m) => (
          <span
            key={m}
            className="font-mono text-xs px-2 py-0.5 rounded border"
            style={{
              borderColor: highlight.has(`value:r${m}`) ? "#9d7bff" : "#9d7bff44",
              color: "#cfd6ff",
              background: highlight.has(`value:r${m}`) ? "#9d7bff22" : "transparent",
            }}
          >
            mod {m}
          </span>
        ))}
      </div>
      <div className="rounded border border-violet-300/20 p-3 bg-violet-500/5">
        <div className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-2">
          Residues
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {Object.entries(residue.residues).map(([body, vals]) => (
            <div key={body} className="flex items-center justify-between font-mono">
              <span className="text-white/70">{body}</span>
              <span className="text-violet-200">[{vals.join(", ")}]</span>
            </div>
          ))}
        </div>
      </div>
      {residue.crtLaneId && (
        <div className="text-[10px] font-mono text-white/55 text-center">
          lane: <span className="text-violet-200">{residue.crtLaneId}</span>
        </div>
      )}
    </div>
  );
}
