import { createFileRoute } from "@tanstack/react-router";
import { ValidationBadge } from "@/components/qmnf/ValidationBadge";
import { VALIDATION_IDENTITIES } from "@/lib/qmnf/validation";

function FalsifyRoute() {
  return (
    <div className="space-y-8">
      <header className="space-y-2 max-w-3xl">
        <h1 className="font-serif text-3xl" style={{ color: "#ff8898" }}>
          How to Disprove the Discovery
        </h1>
        <p className="text-sm text-white/70 leading-relaxed">
          A scientific claim has to be falsifiable. Here are the concrete observations that would
          knock the framework down. Each one is a one-line integer check — try them yourself.
        </p>
      </header>

      <ol className="space-y-3 list-decimal list-inside text-sm text-white/85">
        <li>
          <strong>Any Dresden Codex period divisible by 11.</strong>
          <br />
          <span className="text-white/60">
            Theorem T7 says none is. If you find one, the discovery falls.
          </span>
        </li>
        <li>
          <strong>gcd(11,960, 93) ≠ 1.</strong>
          <br />
          <span className="text-white/60">
            Theorem T5 (eclipse-table two-phase K-Elim lift) requires coprimality.
          </span>
        </li>
        <li>
          <strong>A fourth prime ℓ ≥ 5 with p(ℓn + δ) ≡ 0 (mod ℓ) for all n.</strong>
          <br />
          <span className="text-white/60">
            Ramanujan's S_R = {`{5, 7, 11}`} would no longer be complete.
          </span>
        </li>
        <li>
          <strong>11,960 mod 378 ≠ 242.</strong>
          <br />
          <span className="text-white/60">Theorem T8 — the shadow signature — would collapse.</span>
        </li>
        <li>
          <strong>A prime other than 11 satisfying all five T-SHADOW conditions.</strong>
          <br />
          <span className="text-white/60">Uniqueness of the shadow prime would fail.</span>
        </li>
        <li>
          <strong>Δ_V (= 11,960 mod 584) without both 5 and 7 as factors.</strong>
          <br />
          <span className="text-white/60">
            The S_R distribution theorem (T10) requires the accessible pair on Venus.
          </span>
        </li>
      </ol>

      <section className="space-y-2">
        <h2 className="font-serif text-xl mt-4" style={{ color: "#cfd6ff" }}>
          Verify in your browser
        </h2>
        <p className="text-sm text-white/60">All 14 identities, computed locally.</p>
        <div className="grid sm:grid-cols-2 gap-2">
          {VALIDATION_IDENTITIES.map((v) => (
            <ValidationBadge key={v.id} identity={v} />
          ))}
        </div>
      </section>

      <p className="text-xs font-mono text-white/40 italic pt-6">
        "Truth cannot be approximated." — A. Diaz
      </p>
    </div>
  );
}

export const Route = createFileRoute("/codex/falsify")({
  head: () => ({ meta: [{ title: "Falsifiability — Prime Resonance Astrology" }] }),
  component: FalsifyRoute,
});
