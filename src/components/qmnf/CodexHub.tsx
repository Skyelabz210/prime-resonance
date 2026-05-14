import { Link } from "@tanstack/react-router";
import {
  DRESDEN_PERIODS,
  S_R,
  DISC_PRIMES,
  SATURN_DISPLACEMENT,
  S_R_DISTRIBUTION,
  SHADOW_CONDITIONS,
  SHADOW_PRIME_UNIQUE_PROOF,
  shadowConditionTable,
} from "@/lib/qmnf/codex";
import { FalsifiableClaim } from "./FalsifiableClaim";

export function CodexHub() {
  const conditions = shadowConditionTable();

  return (
    <div className="space-y-10">
      <section>
        <h2 className="font-serif text-3xl mb-2" style={{ color: "#e6e8ff" }}>
          The Discovery
        </h2>
        <p className="text-sm text-white/75 leading-relaxed max-w-3xl">
          Prime{" "}
          <span className="font-mono" style={{ color: "#9d7bff" }}>
            11
          </span>{" "}
          is the unique <em>shadow channel</em> connecting the Dresden Codex period set to the
          modern astrological substrate. Saturn's 33-year displacement carries 11², the Biquintile
          fires exclusively on lane 11, and the entire Ramanujan set {`{5,7,11}`} distributes across
          Mars, Venus, and Saturn's residues. The Codex is not a list of dates — it is a
          continuously executing CRT program on the 30,030 torus.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            to="/codex/theorems"
            className="rounded border px-4 py-2 text-sm font-mono uppercase tracking-widest"
            style={{ borderColor: "#9d7bff66", color: "#cfd6ff" }}
          >
            T1 – T10 →
          </Link>
          <Link
            to="/codex/pages"
            className="rounded border px-4 py-2 text-sm font-mono uppercase tracking-widest"
            style={{ borderColor: "#5dd6c466", color: "#5dd6c4" }}
          >
            Pages 1 – 74 →
          </Link>
          <Link
            to="/codex/falsify"
            className="rounded border px-4 py-2 text-sm font-mono uppercase tracking-widest"
            style={{ borderColor: "#ff889866", color: "#ff8898" }}
          >
            How to disprove →
          </Link>
        </div>
      </section>

      {/* Period set */}
      <section>
        <h3 className="font-serif text-xl mb-3" style={{ color: "#ffd56b" }}>
          The Dresden Period Set
        </h3>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
          {DRESDEN_PERIODS.map((p) => (
            <div
              key={p.name}
              className="rounded border bg-black/30 px-3 py-2 text-xs"
              style={{ borderColor: "#ffd56b22" }}
            >
              <div className="flex items-baseline justify-between">
                <span className="text-white/85 font-serif">{p.name}</span>
                <span className="font-mono text-white/70">{p.days.toLocaleString()} d</span>
              </div>
              <div className="font-mono text-[10px] text-white/55">{p.factorization}</div>
              <div className="text-[10px] text-white/45 italic">{p.significance}</div>
            </div>
          ))}
        </div>
        <FalsifiableClaim>
          Find any Dresden Codex period divisible by 11 — Theorem T7 falls, the framework falls.
        </FalsifiableClaim>
      </section>

      {/* Shadow conditions */}
      <section>
        <h3 className="font-serif text-xl mb-3" style={{ color: "#9d7bff" }}>
          The Five T-SHADOW Conditions
        </h3>
        <ul className="space-y-1 mb-4 text-sm text-white/75 font-mono">
          {SHADOW_CONDITIONS.map((c) => (
            <li key={c.id}>
              <span className="text-white/40 mr-2">{c.id}</span>
              <span className="text-white/90">{c.name}</span>:{" "}
              <span className="text-white/65">{c.description}</span>
            </li>
          ))}
        </ul>
        <div className="overflow-x-auto rounded border" style={{ borderColor: "#9d7bff22" }}>
          <table className="w-full text-xs font-mono">
            <thead className="bg-black/30">
              <tr>
                <th className="text-left px-2 py-1.5">prime</th>
                <th>S1</th>
                <th>S2</th>
                <th>S3</th>
                <th>S4</th>
                <th>S5</th>
                <th className="px-2">shadow?</th>
              </tr>
            </thead>
            <tbody>
              {conditions.map((r) => (
                <tr key={r.prime} className="border-t border-white/5">
                  <td className="px-2 py-1.5 text-white/85">ℓ = {r.prime}</td>
                  {[r.S1, r.S2, r.S3, r.S4, r.S5].map((v, i) => (
                    <td key={i} className="text-center">
                      <span style={{ color: v ? "#5dd6c4" : "#ff8898" }}>{v ? "✓" : "✗"}</span>
                    </td>
                  ))}
                  <td
                    className="px-2 text-center font-bold"
                    style={{ color: r.isShadow ? "#9d7bff" : "#ffffff40" }}
                  >
                    {r.isShadow ? "YES" : "no"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <pre className="mt-3 rounded bg-black/40 px-3 py-2 text-[10px] font-mono text-white/70 whitespace-pre-wrap">
          {SHADOW_PRIME_UNIQUE_PROOF}
        </pre>
        <FalsifiableClaim>
          Find a prime other than 11 satisfying all five conditions — uniqueness fails.
        </FalsifiableClaim>
      </section>

      {/* The shadow signature */}
      <section>
        <h3 className="font-serif text-xl mb-3" style={{ color: "#9d7bff" }}>
          The Shadow Signature
        </h3>
        <div
          className="rounded border p-4 font-mono text-sm"
          style={{ borderColor: "#9d7bff44", background: "#9d7bff08" }}
        >
          <div className="text-white/85">
            Δ<sub>S</sub> = 11,960 mod 378 ={" "}
            <span style={{ color: "#9d7bff" }}>{SATURN_DISPLACEMENT}</span> = 2 × 11²
          </div>
          <div className="mt-2 text-white/55 text-xs">
            Of every period in the Codex, the prime 11 appears in exactly one place: Saturn's
            33-year displacement. And it appears <em>squared</em>.
          </div>
        </div>
      </section>

      {/* S_R distribution */}
      <section>
        <h3 className="font-serif text-xl mb-3" style={{ color: "#ffd56b" }}>
          S_R Distribution (Theorem T10)
        </h3>
        <div className="grid sm:grid-cols-3 gap-3">
          {S_R_DISTRIBUTION.map((d) => (
            <div
              key={d.planet}
              className="rounded border bg-black/30 p-3"
              style={{ borderColor: "#ffd56b33" }}
            >
              <div className="font-serif text-lg text-white/90">{d.planet}</div>
              <div className="font-mono text-xs text-white/65">
                Δ = {d.delta} = {d.factorization}
              </div>
              <div className="text-xs text-white/75 mt-1">{d.carries}</div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-white/55 italic">
          Mars + Venus + Saturn together recover S_R = {`{${S_R.join(", ")}}`} — the complete
          Ramanujan set, distributed across the planetary residues. The discriminating primes D ={" "}
          {`{${DISC_PRIMES.join(", ")}}`} are the CRAM signature lanes.
        </p>
      </section>
    </div>
  );
}
