import { useRigor } from "@/lib/qmnf/rigor";
import type { ReactNode } from "react";

/**
 * Gate component. Only renders its children when the user has the
 * Rigor toggle ON. Standard mode hides the math entirely so the
 * astrology reading stays clean.
 */
export function Rigorous({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { mode } = useRigor();
  if (mode !== "rigorous") return <>{fallback}</>;
  return (
    <div
      className="qmnf-rigorous"
      style={{
        borderLeft: "2px solid #9d7bff55",
        paddingLeft: "0.5rem",
        marginTop: "0.5rem",
        fontSize: "0.78rem",
        color: "#c6c8e8",
      }}
    >
      {children}
    </div>
  );
}
