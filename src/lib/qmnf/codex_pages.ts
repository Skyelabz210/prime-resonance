// Page-by-page HULTA/CRAM decoding of the Dresden Codex (pages 1–74).
//
// Source: Dresden_Codex__Full_PagebyPage_HULTA_CRAM_Decodi_1.md.
//
// The Codex is read here as a parallel Residue Number System (RNS)
// processor. Each phase is one execution stage; the four phases form a
// closed loop (page 74's "Great Deluge" resets the state vector so
// page 1 can re-initialize from zero). This is the user's continuous-
// system hypothesis: the Codex is not a list of dates but a program
// that loops forever on the 30,030 torus.

export type Phase = "Biological" | "MarsAgricultural" | "Astronomical" | "Prophetic";

export interface CodexPage {
  start: number;
  end: number; // inclusive page range (often a single page)
  phase: Phase;
  title: string;
  motif: string; // visual / iconographic summary
  /** Sample state vector (r2, r3, r5, r7, r11, r13). Some pages set 0 for a lane,
   *  some leave a lane "drifting". Use null for "drift". */
  state: [number | null, number | null, number | null, number | null, number | null, number | null];
  carry: "black" | "red-rare" | "red-frequent" | "red-black-alternating" | "reset";
  identity: string; // the math claim this page encodes
}

export const CODEX_PAGES: readonly CodexPage[] = [
  // Phase 1 — Biological Domain (Tzolk'in 260)
  {
    start: 1,
    end: 1,
    phase: "Biological",
    title: "Initialization & Noise",
    motif: "Damaged header; bar-dot setup",
    state: [0, null, 0, null, null, 0],
    carry: "black",
    identity: "260 ≡ 0 (mod 2,5,13) — set the Tzolk'in clock",
  },
  {
    start: 2,
    end: 2,
    phase: "Biological",
    title: "The 260-Day Register",
    motif: "Ritual scenes",
    state: [0, null, 0, null, null, 0],
    carry: "black",
    identity: "Steady-state on lane 13 — no K-Elim triggers",
  },
  {
    start: 3,
    end: 3,
    phase: "Biological",
    title: "Thread Branching",
    motif: "Horizontal bands — two parallel registers",
    state: [0, null, 0, null, null, 0],
    carry: "black",
    identity: "Branch: crop thread vs ritual thread",
  },
  {
    start: 4,
    end: 4,
    phase: "Biological",
    title: "11-Shadow Lane Introduction",
    motif: "Chac (blue-green pigment) appears",
    state: [0, null, 0, null, 7, 0],
    carry: "black",
    identity: "260 mod 11 = 7 — drift begins",
  },
  {
    start: 5,
    end: 5,
    phase: "Biological",
    title: "Residue Synchronization",
    motif: "Complex glyph blocks",
    state: [0, null, 0, null, null, 0],
    carry: "black",
    identity: "gcd(260, 365) = 5 — the common anchor",
  },
  {
    start: 6,
    end: 10,
    phase: "Biological",
    title: "High-Frequency Biological Registers",
    motif: "Itzamná, Chac — agricultural rituals",
    state: [0, 0, null, null, null, 0],
    carry: "red-rare",
    identity: "78 ≡ 0 (mod 2,3,13) — lanes 5, 7, 11 carry the work",
  },
  {
    start: 11,
    end: 15,
    phase: "Biological",
    title: "Interaction of Threads",
    motif: "Paired figures",
    state: [null, null, null, null, null, null],
    carry: "red-rare",
    identity: "Checksum for 260/365 commensurability (18,980 days)",
  },
  {
    start: 16,
    end: 23,
    phase: "Biological",
    title: "11-Shadow Lane Saturation",
    motif: "Goddess I (Moon), patrons",
    state: [null, null, null, null, null, null],
    carry: "red-frequent",
    identity: "Lane 11 fills — pre-buffer for domain handoff",
  },

  // Page 24 — bootloader
  {
    start: 24,
    end: 24,
    phase: "Biological",
    title: "Venus-Preface — Bootloader",
    motif: "Dense table of Venus multiples",
    state: [0, null, 0, null, null, 0],
    carry: "black",
    identity: "M = 37,960 = 65 × 584 — load Venus torus registers",
  },

  // Phase 2 — Mars / Agricultural (780-day)
  {
    start: 25,
    end: 28,
    phase: "MarsAgricultural",
    title: "New Year Ceremonies (Register Flush)",
    motif: "Uayeb rituals — Year Bearer glyphs",
    state: [0, null, 0, null, null, 0],
    carry: "reset",
    identity: "Re-index residues to new Haab year",
  },
  {
    start: 29,
    end: 45,
    phase: "MarsAgricultural",
    title: "The 780-Day Mars Stride",
    motif: "Chac in planting/harvest scenes",
    state: [0, 0, 0, 3, 10, 0],
    carry: "black",
    identity: "780 ≡ 0 (mod 2,3,5,13); ≡ 3 (mod 7); ≡ 10 (mod 11) — two-lane processor",
  },

  // Phase 3 — Astronomical
  {
    start: 46,
    end: 50,
    phase: "Astronomical",
    title: "Venus Torus Execution",
    motif: "Spearing deities — Venus rising",
    state: [0, null, 0, null, null, 0],
    carry: "black",
    identity: "65 × 584 = 37,960 ≡ 0 (mod 2,5,13); lane 11 = master clock",
  },
  {
    start: 51,
    end: 58,
    phase: "Astronomical",
    title: "Lunar K-Elimination Engine",
    motif: "Eclipse glyphs; red/black number chains",
    state: [null, null, null, null, null, null],
    carry: "red-black-alternating",
    identity: "K-Elim recovers winding: k ≡ (r_anchor − r_safe) · M_safe⁻¹ (mod M_anchor)",
  },

  // Phase 4 — Prophetic
  {
    start: 59,
    end: 61,
    phase: "Prophetic",
    title: "Prophetic State Vectors",
    motif: "Chac, God L — ritual scenes",
    state: [null, null, null, null, null, null],
    carry: "red-frequent",
    identity: "Full state vector — all six lanes populated",
  },
  {
    start: 62,
    end: 73,
    phase: "Prophetic",
    title: "Serpent Numbers (Infinite Scaffolding)",
    motif: "Large coiled serpents with numbers inside",
    state: [null, null, null, null, null, null],
    carry: "red-frequent",
    identity: "Phase-locked loops on the 30,030 torus — millions of days addressed",
  },

  // Page 74 — system reset (closes the loop)
  {
    start: 74,
    end: 74,
    phase: "Prophetic",
    title: "The Great Deluge — System Reset",
    motif: "Crocodile vomits water; cosmic flood",
    state: [0, 0, 0, 0, 0, 0],
    carry: "reset",
    identity: "M ≡ 0 (mod 2,3,5,7,11,13) — all drift nullified, prerequisite for Page 1",
  },
];

export const PHASE_DESCRIPTIONS: Record<Phase, string> = {
  Biological:
    "Pages 1–24 — Tzolk'in 260-day clock; shadow-lane 11 introduced at page 4; saturated by page 23; page 24 = bootloader.",
  MarsAgricultural:
    "Pages 25–45 — Register flush at the New Year, then the 780-day Mars stride nullifies four lanes (2,3,5,13); only lanes 7 and 11 carry information.",
  Astronomical:
    "Pages 46–58 — Venus torus (37,960 days, lane 11 acts as master clock); lunar K-Elimination engine (red/black alternation = physical realization of K-Elim).",
  Prophetic:
    "Pages 59–74 — Multi-thread synchronization; Serpent Numbers as phase-locked loops on the 30,030 torus; page 74 = Great Deluge / system reset.",
};

/** The Codex's continuity hypothesis: page 74 resets state to zero,
 *  page 1 re-initializes — the program loops. */
export const CONTINUITY_HYPOTHESIS = `
The Dresden Codex is not a static almanac. It is a continuously executing
program on the CRT manifold. Page 74 (the Great Deluge) zeros every safe-
basis lane — exactly the precondition for the noise on Page 1, where the
Tzolk'in clock re-initializes. End to end, the Codex is one closed loop
on the 30,030 torus.
`.trim();
