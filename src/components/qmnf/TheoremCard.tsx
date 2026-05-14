import { useState } from "react";
import type { Theorem } from "@/lib/qmnf/theorems";

const STATUS_COLOR: Record<Theorem["leanStatus"], string> = {
  native_decide: "#5dd6c4",
  decide: "#a8e6cf",
  structural: "#ffd56b",
  pending: "#ff9aa2",
};

export function TheoremCard({ theorem }: { theorem: Theorem }) {
  const [result, setResult] = useState<null | ReturnType<Theorem["verify"]>>(null);

  return (
    <div
      className="rounded border p-4 backdrop-blur"
      style={{
        borderColor: result?.pass ? "#5dd6c455" : "#9d7bff44",
        background: "linear-gradient(135deg,#1a1f3a40,#9d7bff05)",
      }}
    >
      <div className="flex items-start gap-3 mb-2">
        <span className="font-mono text-xs uppercase tracking-widest text-white/40">
          {theorem.id}
        </span>
        <h3 className="font-serif text-lg text-white/90 leading-tight flex-1">{theorem.title}</h3>
        <span
          className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border"
          style={{
            color: STATUS_COLOR[theorem.leanStatus],
            borderColor: `${STATUS_COLOR[theorem.leanStatus]}55`,
          }}
        >
          {theorem.leanStatus.replace("_", " ")}
        </span>
      </div>

      <p className="text-sm text-white/75 mb-2 leading-relaxed">{theorem.statement}</p>

      <div className="text-[10px] font-mono text-white/40 mb-2">
        Depends on: {theorem.dependencies.join(" · ")}
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => setResult(theorem.verify())}
          className="rounded px-3 py-1 text-xs font-mono uppercase tracking-widest"
          style={{
            background: result?.pass ? "#5dd6c422" : "linear-gradient(135deg,#9d7bff44,#5a3fff44)",
            color: result?.pass ? "#5dd6c4" : "#cfd6ff",
            border: `1px solid ${result?.pass ? "#5dd6c466" : "#9d7bff66"}`,
          }}
        >
          {result ? (result.pass ? "✓ verified" : "✗ failed") : "Verify now"}
        </button>
        {result && (
          <div className="text-[11px] font-mono text-white/70 ml-3">
            {Object.entries(result.values).map(([k, v]) => (
              <span key={k} className="ml-3">
                <span className="text-white/40">{k}</span> ={" "}
                <span className="text-emerald-300">{v}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
