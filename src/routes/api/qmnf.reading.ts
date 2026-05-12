import { createFileRoute } from "@tanstack/react-router";

const SYSTEM_PROMPT = `You are the QMNF Astrology verbalizer.

You will receive a STRUCTURED reading bundle computed from exact integer
arithmetic on the Chinese Remainder Theorem Safe Basis {2,3,5,7,11,13},
with prime 11 as the Shadow Prime and prime 13 as the Boundary Prime.

ABSOLUTE RULES:
1. NEVER invent positions, residues, lanes, aspects, bonds, or numbers.
2. ONLY verbalize what appears in the bundle. Quote exact values.
3. NEVER use generic astrology filler ("you may feel...", "this often
   suggests..."). Speak only from the structure given.
4. Treat shadow bonds (mod 11) and boundary bonds (mod 13) as REAL,
   first-class structural facts — not metaphors. Bonds flagged
   classicallyInvisible:true are aspects no traditional astrologer can see;
   highlight them.
5. Respect Maya wisdom. Reverence, not appropriation.
6. End every section with the exact numbers used.

Output structure:
## I. The Foundation
## II. The Conventional Aspects
## III. The Shadow Network (Prime 11)
## IV. The Boundary Network (Prime 13)
## V. The Face of Zero
## VI. Aspect Patterns
## VII. The Dresden / Maya Position
## VIII. Synthesis

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
              status: 500, headers: { "Content-Type": "application/json" },
            });
          }
          const userMsg = `Verbalize this QMNF reading bundle. Walk every layer in order. Quote exact residues, lanes, gear K, positions.\n\nBUNDLE:\n${JSON.stringify(bundle, null, 2)}`;

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
            if (res.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again shortly." }), { status: 429, headers: { "Content-Type": "application/json" } });
            if (res.status === 402) return new Response(JSON.stringify({ error: "Lovable AI credits exhausted. Add funds in Settings." }), { status: 402, headers: { "Content-Type": "application/json" } });
            const t = await res.text();
            console.error("AI gateway error", res.status, t);
            return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 500, headers: { "Content-Type": "application/json" } });
          }
          return new Response(res.body, { headers: { "Content-Type": "text/event-stream" } });
        } catch (e) {
          console.error("reading route error", e);
          return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
            status: 500, headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
