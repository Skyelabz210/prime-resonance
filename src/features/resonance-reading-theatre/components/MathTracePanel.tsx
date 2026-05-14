import type { MathTrace } from "../types/resonanceTypes";

function fmt(v: unknown): string {
  if (typeof v === "number") return Number.isInteger(v) ? String(v) : v.toFixed(4);
  if (typeof v === "string") return v;
  if (typeof v === "boolean") return v ? "true" : "false";
  if (Array.isArray(v)) return `[${v.map(fmt).join(", ")}]`;
  if (v == null) return "—";
  return JSON.stringify(v);
}

export function MathTracePanel({ math }: { math: MathTrace }) {
  return (
    <div className="space-y-4 text-left">
      <div>
        <div className="text-[10px] font-mono uppercase tracking-widest text-white/40">
          Summary
        </div>
        <div className="text-sm text-white/90 mt-1">{math.summary}</div>
      </div>

      <Section title="Inputs">
        <KV obj={math.inputs} />
      </Section>

      <Section title="Equations">
        <ul className="space-y-1">
          {math.equations.map((eq, i) => (
            <li key={i} className="font-mono text-xs text-emerald-200/90">
              <span className="text-white/30 mr-2">{i + 1}.</span>
              {eq}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Intermediate Values">
        <KV obj={math.intermediateValues} />
      </Section>

      <Section title="Final Scores">
        <KV obj={math.finalScores} highlight />
      </Section>

      <Section title="Reasoning Path">
        <ol className="space-y-1 list-decimal list-inside text-xs text-white/75">
          {math.reasoningPath.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-1.5">
        {title}
      </div>
      {children}
    </div>
  );
}

function KV({ obj, highlight }: { obj: Record<string, unknown>; highlight?: boolean }) {
  const entries = Object.entries(obj);
  if (entries.length === 0) return <div className="text-xs text-white/40">— none —</div>;
  return (
    <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 text-xs">
      {entries.map(([k, v]) => (
        <div className="contents" key={k}>
          <dt className="font-mono text-white/45">{k}</dt>
          <dd
            className={`font-mono tabular-nums ${highlight ? "text-violet-200" : "text-white/85"}`}
          >
            {fmt(v)}
          </dd>
        </div>
      ))}
    </dl>
  );
}
