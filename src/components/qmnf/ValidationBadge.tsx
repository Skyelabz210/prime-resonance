import { useState } from "react";
import type { ValidationIdentity } from "@/lib/qmnf/validation";

export function ValidationBadge({ identity }: { identity: ValidationIdentity }) {
  const [verified, setVerified] = useState<null | { pass: boolean; evidence: string }>(null);

  const run = () => {
    setVerified({ pass: identity.check(), evidence: identity.evidence() });
  };

  return (
    <div
      className="rounded border bg-black/30 px-3 py-2"
      style={{ borderColor: verified?.pass ? "#5dd6c466" : verified ? "#ff667766" : "#ffffff10" }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] text-white/85">
          <span className="text-[10px] mr-2 text-white/40 uppercase tracking-widest">
            {identity.id}
          </span>
          {identity.label}
        </span>
        <button
          onClick={run}
          className="rounded px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest"
          style={{
            background: verified?.pass ? "#5dd6c422" : verified ? "#ff667722" : "#ffffff10",
            color: verified?.pass ? "#5dd6c4" : verified ? "#ff8898" : "#cfd6ff",
            border: `1px solid ${verified?.pass ? "#5dd6c466" : verified ? "#ff667766" : "#ffffff20"}`,
          }}
        >
          {verified ? (verified.pass ? "✓ pass" : "✗ fail") : "verify"}
        </button>
      </div>
      {verified && (
        <div className="mt-1 text-[10px] font-mono text-white/55">{verified.evidence}</div>
      )}
    </div>
  );
}
