import type { FullChart } from "@/lib/qmnf/chart";
import { SHADOW_LANE_NAMES, BOUNDARY_LANE_NAMES } from "@/lib/qmnf/constants";

export function FaceOfZeroPanel({ chart }: { chart: FullChart }) {
  return (
    <div className="rounded-lg border p-4 backdrop-blur"
      style={{ borderColor: "#5dd6c433", background: "linear-gradient(135deg,#9d7bff10,#ffb34710)" }}>
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="font-serif text-xl" style={{ color: "#e6e8ff" }}>Face of Zero</h2>
        <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">
          11 ∧ 13 · {chart.faceOfZero.length} loci
        </span>
      </div>
      <p className="text-xs text-white/50 mb-3 italic">
        Pairs locked on BOTH the Shadow lane and the Boundary lane. The chart's
        irreducible structural anchors.
      </p>
      <div className="space-y-2 max-h-72 overflow-auto">
        {chart.faceOfZero.map((f, i) => (
          <div key={i} className="rounded border border-white/10 px-3 py-2"
            style={{ background: "#0a0e1a80" }}>
            <div className="text-sm font-mono text-white/90">{f.a} ↔ {f.b}</div>
            <div className="text-[11px] font-mono mt-1">
              <span style={{ color: "#9d7bff" }}>Shadow: {SHADOW_LANE_NAMES[f.shadowResidue]} (r₁₁={f.shadowResidue})</span>
              {" · "}
              <span style={{ color: "#ffb347" }}>Boundary: {BOUNDARY_LANE_NAMES[f.boundaryResidue]} (r₁₃={f.boundaryResidue})</span>
            </div>
          </div>
        ))}
        {chart.faceOfZero.length === 0 && (
          <div className="text-xs text-white/40 italic py-3">No Face-of-Zero loci.</div>
        )}
      </div>
    </div>
  );
}
