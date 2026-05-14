// localStorage chart library — saved birth data with metadata.
// No backend, no auth. Browser-local.

import type { BirthData } from "./chart";

const KEY = "qmnf.charts";

export interface SavedChart {
  id: string; // random UUID-ish
  birth: BirthData;
  savedAt: number; // epoch ms
}

function nowId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function safeLoad(): SavedChart[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SavedChart[]) : [];
  } catch {
    return [];
  }
}

function safeSave(charts: SavedChart[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(charts));
  } catch {
    /* quota etc. */
  }
}

export function listCharts(): SavedChart[] {
  return safeLoad().sort((a, b) => b.savedAt - a.savedAt);
}

export function saveChart(birth: BirthData): SavedChart {
  const charts = safeLoad();
  const id = nowId();
  const item: SavedChart = { id, birth, savedAt: Date.now() };
  // Drop earlier duplicates of the same name+datetime.
  const filtered = charts.filter(
    (c) =>
      !(
        c.birth.name === birth.name &&
        c.birth.year === birth.year &&
        c.birth.month === birth.month &&
        c.birth.day === birth.day &&
        c.birth.hour === birth.hour &&
        c.birth.minute === birth.minute
      ),
  );
  filtered.unshift(item);
  safeSave(filtered);
  return item;
}

export function getChart(id: string): SavedChart | null {
  return safeLoad().find((c) => c.id === id) ?? null;
}

export function deleteChart(id: string): void {
  safeSave(safeLoad().filter((c) => c.id !== id));
}

export function exportCharts(): string {
  return JSON.stringify(safeLoad(), null, 2);
}

export function importCharts(json: string): number {
  try {
    const arr = JSON.parse(json) as SavedChart[];
    if (!Array.isArray(arr)) return 0;
    const existing = new Set(safeLoad().map((c) => c.id));
    const merged = [...safeLoad(), ...arr.filter((c) => c?.id && !existing.has(c.id))];
    safeSave(merged);
    return arr.length;
  } catch {
    return 0;
  }
}
