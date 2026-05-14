import type { ReactNode } from "react";

/**
 * "If X, the framework falls" — a concrete falsifiable claim, shown
 * inline next to a theorem or shadow-condition row.
 */
export function FalsifiableClaim({ children }: { children: ReactNode }) {
  return (
    <div
      className="mt-2 rounded border px-3 py-2 text-[11px] font-mono leading-relaxed"
      style={{ borderColor: "#ff667744", background: "#ff667710", color: "#ffb0b8" }}
    >
      <span className="uppercase tracking-widest text-[9px] mr-2" style={{ color: "#ff8898" }}>
        Falsifiable
      </span>
      {children}
    </div>
  );
}
