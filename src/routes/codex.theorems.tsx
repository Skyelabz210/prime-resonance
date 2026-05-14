import { createFileRoute } from "@tanstack/react-router";
import { THEOREMS } from "@/lib/qmnf/theorems";
import { VALIDATION_IDENTITIES } from "@/lib/qmnf/validation";
import { TheoremCard } from "@/components/qmnf/TheoremCard";
import { ValidationBadge } from "@/components/qmnf/ValidationBadge";

function TheoremsRoute() {
  return (
    <div className="space-y-8">
      <header className="space-y-2 max-w-3xl">
        <h1 className="font-serif text-3xl" style={{ color: "#e6e8ff" }}>
          DPM-PRIME — Ten Theorems
        </h1>
        <p className="text-sm text-white/70 leading-relaxed">
          Each theorem reduces to integer arithmetic. Click <em>Verify now</em> on any card and the
          computation runs in your browser. If your machine returns a different answer, publish it —
          the framework is wrong.
        </p>
      </header>

      <section className="space-y-3">
        {THEOREMS.map((t) => (
          <TheoremCard key={t.id} theorem={t} />
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-2xl mt-8" style={{ color: "#5dd6c4" }}>
          Validation Identities (V1–V14)
        </h2>
        <p className="text-sm text-white/65 max-w-2xl">
          Granular integer checks — every one is{" "}
          <code className="font-mono text-[11px]">native_decide</code>-clean in Lean 4. Click{" "}
          <em>verify</em> on each row to run it locally.
        </p>
        <div className="grid sm:grid-cols-2 gap-2">
          {VALIDATION_IDENTITIES.map((v) => (
            <ValidationBadge key={v.id} identity={v} />
          ))}
        </div>
      </section>
    </div>
  );
}

export const Route = createFileRoute("/codex/theorems")({
  head: () => ({ meta: [{ title: "Theorems — Prime Resonance Astrology" }] }),
  component: TheoremsRoute,
});
