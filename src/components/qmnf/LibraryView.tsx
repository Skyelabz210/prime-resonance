import { useState, useEffect } from "react";
import {
  listCharts,
  deleteChart,
  exportCharts,
  importCharts,
  type SavedChart,
} from "@/lib/qmnf/store";
import { Link } from "@tanstack/react-router";

function formatBornDate(b: SavedChart["birth"]): string {
  return (
    `${b.year}-${String(b.month).padStart(2, "0")}-${String(b.day).padStart(2, "0")} ` +
    `${String(b.hour).padStart(2, "0")}:${String(b.minute).padStart(2, "0")}`
  );
}

export function LibraryView() {
  const [charts, setCharts] = useState<SavedChart[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  const refresh = () => setCharts(listCharts());
  useEffect(refresh, []);

  const onDelete = (id: string) => {
    if (confirm("Delete this saved chart?")) {
      deleteChart(id);
      refresh();
    }
  };

  const onExport = () => {
    const json = exportCharts();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "qmnf-charts.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const onImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const n = importCharts(text);
    setMsg(n ? `Imported ${n} chart${n === 1 ? "" : "s"}.` : "Nothing imported.");
    refresh();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-3xl" style={{ color: "#e6e8ff" }}>
          Saved Charts
        </h2>
        <div className="flex items-center gap-2 text-xs font-mono">
          <button
            onClick={onExport}
            className="rounded border px-3 py-1 text-white/85"
            style={{ borderColor: "#ffffff20" }}
          >
            Export JSON
          </button>
          <label
            className="rounded border px-3 py-1 cursor-pointer text-white/85"
            style={{ borderColor: "#ffffff20" }}
          >
            Import
            <input type="file" accept="application/json" className="hidden" onChange={onImport} />
          </label>
        </div>
      </div>

      {msg && <div className="text-xs font-mono text-emerald-300">{msg}</div>}

      {!charts.length && (
        <div
          className="rounded border p-6 text-center text-sm text-white/55"
          style={{ borderColor: "#ffffff10" }}
        >
          No saved charts yet. Compute one on the{" "}
          <Link to="/natal" className="underline">
            Natal page
          </Link>{" "}
          and click "Save chart".
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        {charts.map((c) => (
          <div
            key={c.id}
            className="rounded border p-3 bg-black/30 flex items-start justify-between"
            style={{ borderColor: "#9d7bff33" }}
          >
            <div>
              <div className="font-serif text-base text-white/90">
                {c.birth.name || "(unnamed)"}
              </div>
              <div className="text-xs font-mono text-white/55">
                {formatBornDate(c.birth)} · UTC{c.birth.tzOffsetHours >= 0 ? "+" : ""}
                {c.birth.tzOffsetHours}
              </div>
              <div className="text-[10px] font-mono text-white/40">
                {c.birth.latitude.toFixed(2)}, {c.birth.longitude.toFixed(2)} ·{" "}
                {c.birth.houseSystem}
              </div>
              <Link
                to="/natal"
                search={{ id: c.id }}
                className="mt-2 inline-block rounded border px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest"
                style={{ borderColor: "#9d7bff66", color: "#cfd6ff" }}
              >
                Load →
              </Link>
            </div>
            <button
              onClick={() => onDelete(c.id)}
              className="text-[10px] text-white/40 hover:text-red-300 font-mono"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
