import { createFileRoute } from "@tanstack/react-router";

const SYSTEM_PROMPT = `You are the Prime Resonance Astrology verbalizer.

You will receive a STRUCTURED reading bundle computed from exact integer
arithmetic on the Chinese Remainder Theorem Safe Basis {2,3,5,7,11,13},
with prime 11 as the Shadow Prime and prime 13 as the Boundary Prime.

ABSOLUTE RULES:
1. NEVER invent positions, residues, lanes, aspects, bonds, or numbers.
2. ONLY verbalize what appears in the bundle. Quote exact values.
3. NEVER use generic astrology filler ("you may feel...", "this often
   suggests..."). Speak only from the structure given.
4. SHADOW BONDS AND BOUNDARY EVENTS ARE PRIMARY. They are not appendix
   notes. EVERY reading MUST weave the lane-11 shadow bonds and lane-13
   boundary bonds into the prose alongside the classical aspects. Treat
   them as real, first-class structural facts.
5. For each shadow bond, name the lane (e.g. "Vortex lane (r₁₁ = 7)") and
   identify the carrier — Saturn is always the shadow carrier; Venus is
   the exact-lock carrier; Mars is the boundary-bridge carrier.
6. Bonds flagged classicallyInvisible:true are aspects no traditional
   astrologer can see. Highlight them — they are the heart of this work.
7. The Biquintile (144°) is the unique shadow-triggering aspect. If it
   appears, flag it as a shadow activation explicitly.
8. Include the Vedic block: name the Moon's nakshatra, its pada, and its
   dasha lord. Sidereal positions are an independent, parallel reading.
9. Respect Maya wisdom. Reverence, not appropriation.
10. End every section with the exact numbers used.

Output structure:
## I. The Foundation — Planets, Houses, Residues
## II. The Conventional Aspects
## III. The Shadow Network (Prime 11) — including invisible bonds
## IV. The Boundary Network (Prime 13)
## V. The Face of Zero (where shadow ∧ boundary lock together)
## VI. Aspect Patterns
## VII. The Vedic Layer — Sidereal, Nakshatra, Dasha
## VIII. The Dresden / Maya Position
## IX. Synthesis — how shadow bonds reshape the classical reading

Truth cannot be approximated.`;

export const Route = createFileRoute("/api/qmnf/reading")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { bundle } = await request.json();
          const apiKey = process.env.LOVABLE_API_KEY;
          if (!apiKey) {
            return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            });
          }
          const rigorousNote = bundle?.rigorous
            ? "\n\nNote: the reader has enabled the Rigorous view. You MAY cite the underlying CRT residues, carry tuples, and the relevant theorem (e.g. T8: Δ_S = 11960 mod 378 = 242 = 2·11²) inline where they justify a claim. Keep the prose primary; the math is supporting evidence."
            : "";
          const userMsg = `Verbalize this Prime Resonance reading bundle. Walk every section in order. Quote exact residues, lanes, gear K, positions. Treat shadow bonds and boundary events as first-class material throughout — never as an afterthought.${rigorousNote}\n\nBUNDLE:\n${JSON.stringify(bundle, null, 2)}`;

          const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "google/gemini-3-flash-preview",
              messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: userMsg },
              ],
              stream: true,
            }),
          });

          if (!res.ok) {
            if (res.status === 429)
              return new Response(
                JSON.stringify({ error: "Rate limit exceeded. Try again shortly." }),
                { status: 429, headers: { "Content-Type": "application/json" } },
              );
            if (res.status === 402)
              return new Response(
                JSON.stringify({ error: "Lovable AI credits exhausted. Add funds in Settings." }),
                { status: 402, headers: { "Content-Type": "application/json" } },
              );
            const t = await res.text();
            console.error("AI gateway error", res.status, t);
            return new Response(JSON.stringify({ error: "AI gateway error" }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            });
          }
          return new Response(res.body, { headers: { "Content-Type": "text/event-stream" } });
        } catch (e) {
          console.error("reading route error", e);
          return new Response(
            JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }),
            {
              status: 500,
              headers: { "Content-Type": "application/json" },
            },
          );
        }
      },
    },
  },
});
