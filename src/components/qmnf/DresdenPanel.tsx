import type { FullChart } from "@/lib/qmnf/chart";
import { Rigorous } from "./Rigorous";
import { SATURN_DISPLACEMENT } from "@/lib/qmnf/codex";

export function DresdenPanel({ chart }: { chart: FullChart }) {
  const m = chart.maya;
  const stationColor: Record<string, string> = {
    "East-Red": "#ff6b6b",
    "North-White": "#e6e8ff",
    "West-Black": "#666",
    "South-Yellow": "#ffd56b",
  };
  return (
    <div
      className="rounded-lg border p-4 backdrop-blur"
      style={{ borderColor: "#5dd6c433", background: "#5dd6c408" }}
    >
      <h2 className="font-serif text-xl mb-1" style={{ color: "#a3ecdf" }}>
        Dresden Codex Position
      </h2>
      <p className="text-xs text-white/50 italic mb-3">
        Maya astronomical reckoning at this moment.
      </p>
      <div className="grid sm:grid-cols-2 gap-2 text-xs font-mono">
        <Field label="Long Count" value={m.longCount} />
        <Field label="Calendar Round" value={m.calendarRound} />
        <Field label="Tzolk'in" value={`${m.tzolkin.number} ${m.tzolkin.name}`} />
        <Field label="Haab" value={`${m.haab.day} ${m.haab.month}`} />
        <Field
          label="819-day station"
          value={`${m.station819.color} (day ${m.station819.dayInCycle})`}
          color={stationColor[m.station819.color]}
        />
        <Field
          label="Venus phase"
          value={`${m.venusPhase.phase} (day ${m.venusPhase.dayInCycle}/584)`}
        />
      </div>
      <Rigorous>
        <div className="text-[10px] font-mono">
          Codex periods: Tzolk'in 260 = 2²·5·13 · Haab 365 = 5·73 · Venus 584 = 2³·73 · Saturn 378 =
          2·3³·7. Δ<sub>S</sub> = 11960 mod 378 ={" "}
          <span style={{ color: "#9d7bff" }}>{SATURN_DISPLACEMENT}</span> = 2·11² — the only place
          the shadow prime appears in the Codex.
        </div>
      </Rigorous>
    </div>
  );
}

function Field({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded bg-black/30 px-3 py-2">
      <div className="text-[10px] uppercase tracking-widest text-white/40">{label}</div>
      <div className="text-sm" style={{ color: color || "#e6e8ff" }}>
        {value}
      </div>
    </div>
  );
}
