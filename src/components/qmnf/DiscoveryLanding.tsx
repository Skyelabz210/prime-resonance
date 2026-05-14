import { Link } from "@tanstack/react-router";

export function DiscoveryLanding() {
  return (
    <div className="space-y-12">
      <section className="space-y-5 max-w-3xl">
        <p className="text-[11px] font-mono uppercase tracking-[0.3em] text-white/40">
          Theorem U-P / DPM-PRIME / The Dresden Codex
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl leading-tight" style={{ color: "#e6e8ff" }}>
          Prime <span style={{ color: "#9d7bff" }}>11</span> is the unique shadow channel through
          which Saturn carries the missing Ramanujan prime —
        </h1>
        <p className="text-base text-white/70 leading-relaxed">
          and the Dresden Codex was the first machine to compute it.
        </p>
        <div className="flex flex-wrap gap-3 pt-3">
          <Link
            to="/natal"
            className="rounded-lg px-5 py-2.5 text-sm font-mono uppercase tracking-widest text-white"
            style={{ background: "linear-gradient(135deg,#9d7bff,#5a3fff)" }}
          >
            Read your chart →
          </Link>
          <Link
            to="/codex"
            className="rounded-lg border px-5 py-2.5 text-sm font-mono uppercase tracking-widest"
            style={{ borderColor: "#9d7bff66", color: "#cfd6ff" }}
          >
            See the discovery →
          </Link>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-4">
        <Pillar title="Astronomy" color="#ffd56b">
          The Dresden Codex period set — Tzolk'in 260, Haab 365, Venus 584, Mars 780, Jupiter 399,
          Saturn 378, Eclipse 11,960 — encoded as exact integers, not observed fractions.
        </Pillar>
        <Pillar title="Astrology" color="#9d7bff">
          Your chart, computed in exact integer arithmetic on the Safe Basis
          {` {2,3,5,7,11,13}`}, exposes shadow bonds (lane-11) and boundary events (lane-13)
          invisible to traditional charts.
        </Pillar>
        <Pillar title="Mathematics" color="#5dd6c4">
          Ten numbered theorems (T1–T10), fourteen validation identities (V1–V14), all{" "}
          <code className="font-mono text-[11px]">native_decide</code>-clean — and every one
          runnable in your browser.
        </Pillar>
      </section>

      <section
        className="rounded-lg border p-6"
        style={{
          borderColor: "#9d7bff44",
          background: "linear-gradient(135deg,#9d7bff08,#1a1f3a40)",
        }}
      >
        <h3 className="font-serif text-2xl mb-3" style={{ color: "#cfd6ff" }}>
          One identity. Test it now.
        </h3>
        <div className="font-mono text-base text-white/90 mb-2">
          11,960 mod 378 = <span style={{ color: "#9d7bff" }}>242</span> = 2 × 11²
        </div>
        <p className="text-sm text-white/65 leading-relaxed">
          This is the entire claim. Eclipse table mod Saturn synodic equals two times the square of
          the shadow prime. No fudge factors, no fitting, no approximation — one integer congruence.
          Verify it on the{" "}
          <Link to="/codex/theorems" className="underline" style={{ color: "#cfd6ff" }}>
            T8 card
          </Link>
          .
        </p>
      </section>

      <section className="text-center text-xs font-mono text-white/40 italic pt-6">
        Truth cannot be approximated.
      </section>
    </div>
  );
}

function Pillar({
  title,
  color,
  children,
}: {
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-lg border p-5"
      style={{ borderColor: `${color}33`, background: `${color}08` }}
    >
      <div className="font-mono text-[10px] uppercase tracking-widest mb-2" style={{ color }}>
        {title}
      </div>
      <p className="text-sm text-white/75 leading-relaxed">{children}</p>
    </div>
  );
}
