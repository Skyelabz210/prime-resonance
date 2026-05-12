import { createFileRoute } from "@tanstack/react-router";
import { QmnfApp } from "@/components/qmnf/QmnfApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "QMNF Astrology — Exact CRT Natal Charts" },
      { name: "description", content: "Astrology computed in exact integer arithmetic on the Safe Basis primes {2,3,5,7,11,13}, revealing the Shadow Network and Boundary lanes invisible to conventional charts." },
    ],
  }),
  component: QmnfApp,
});
