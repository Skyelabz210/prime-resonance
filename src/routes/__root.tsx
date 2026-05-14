import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { RigorProvider } from "@/lib/qmnf/rigor";
import { RigorToggle } from "@/components/qmnf/RigorToggle";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Prime Resonance — Dresden Codex Astrology" },
      {
        name: "description",
        content:
          "Astrology computed in exact integer arithmetic on the Dresden Codex substrate. Shadow Prime 11, lane-13 boundary network, runtime-verifiable theorems.",
      },
      { property: "og:title", content: "Prime Resonance — Dresden Codex Astrology" },
      {
        property: "og:description",
        content: "Your chart on the CRT manifold. The discovery one toggle away.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

const NAV_LINKS: Array<{ to: string; label: string }> = [
  { to: "/natal", label: "Natal" },
  { to: "/theatre", label: "Theatre" },
  { to: "/vedic", label: "Vedic" },
  { to: "/transits", label: "Transits" },
  { to: "/timeline", label: "Timeline" },
  { to: "/progressed", label: "Progressed" },
  { to: "/synastry", label: "Synastry" },
  { to: "/codex", label: "Codex" },
  { to: "/library", label: "Library" },
];

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <RigorProvider>
        <div
          className="min-h-screen text-foreground"
          style={{
            background: "radial-gradient(ellipse at top, #1a1f3a 0%, #0a0e1a 60%, #050810 100%)",
          }}
        >
          <header
            className="border-b border-white/5 px-4 sm:px-6 py-4 backdrop-blur sticky top-0 z-30"
            style={{ background: "rgba(10,14,26,0.7)" }}
          >
            <div className="mx-auto max-w-7xl flex flex-wrap items-center gap-3">
              <Link to="/" className="font-serif text-lg" style={{ color: "#e6e8ff" }}>
                ☉ <span style={{ color: "#9d7bff" }}>Prime Resonance</span>
              </Link>
              <nav className="flex-1 flex flex-wrap items-center gap-1 sm:gap-3 text-[11px] font-mono uppercase tracking-widest">
                {NAV_LINKS.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    className="text-white/55 hover:text-white/95 transition px-1.5 py-0.5"
                    activeProps={{ style: { color: "#cfd6ff" } }}
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
              <RigorToggle />
            </div>
          </header>
          <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
            <Outlet />
          </main>
          <footer className="border-t border-white/5 px-6 py-6 mt-12">
            <p className="text-center text-[11px] font-mono text-white/40 italic">
              Truth cannot be approximated.
            </p>
          </footer>
        </div>
      </RigorProvider>
    </QueryClientProvider>
  );
}
