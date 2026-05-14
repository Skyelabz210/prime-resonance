// Rigor toggle — Standard vs Rigorous view. Reading text is identical
// in both modes; Rigorous mode reveals the math substrate (residues,
// carries, theorem proofs, falsifiability boxes).

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type RigorMode = "standard" | "rigorous";

interface RigorCtx {
  mode: RigorMode;
  toggle: () => void;
  set: (m: RigorMode) => void;
}

const Ctx = createContext<RigorCtx | null>(null);
const STORAGE_KEY = "qmnf.rigorMode";

export function RigorProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<RigorMode>("standard");

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "rigorous" || stored === "standard") setMode(stored);
    } catch {
      /* ignore */
    }
  }, []);

  const persist = (next: RigorMode) => {
    setMode(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  };

  const value: RigorCtx = {
    mode,
    toggle: () => persist(mode === "standard" ? "rigorous" : "standard"),
    set: persist,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useRigor(): RigorCtx {
  const v = useContext(Ctx);
  if (!v) {
    // Fallback for SSR or outside-provider use: standard mode.
    return { mode: "standard", toggle: () => {}, set: () => {} };
  }
  return v;
}
