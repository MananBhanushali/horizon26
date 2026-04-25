"use client";

import { useApp } from "@/components/providers/AppProvider";
import { TerminalPanel } from "@/components/ui/TerminalPanel";
import { ConfidenceBadge } from "@/components/ui/Badges";
import { buildAlerts } from "@/data/alerts";
import { timeAgo } from "@/lib/format";

export function RightRail() {
  const { persona } = useApp();
  const alerts = buildAlerts(persona).slice(0, 4);

  return (
    <aside className="hidden xl:flex flex-col gap-3 w-[300px] shrink-0 border-l border-[var(--color-edge)] bg-[var(--color-base)] px-3 py-3 sticky top-[60px] h-[calc(100vh-60px)] overflow-y-auto">
      <TerminalPanel title="LIVE ALERTS" subtitle="real-time fixtures" raised>
        <ul className="flex flex-col gap-2">
          {alerts.map((a) => (
            <li
              key={a.id}
              className="rounded border border-[var(--color-edge)] bg-[var(--color-panel)] px-2.5 py-2"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`h-mono text-[10px] uppercase tracking-wider ${
                    a.severity === "critical"
                      ? "text-[var(--color-warn)]"
                      : a.severity === "warning"
                      ? "text-[var(--color-amber)]"
                      : "text-[var(--color-cyan)]"
                  }`}
                >
                  {a.type} · {a.severity}
                </div>
                <span className="h-tick">{timeAgo(a.timestamp)}</span>
              </div>
              <div className="text-[12.5px] mt-1 font-medium">{a.title}</div>
              <div className="text-[11.5px] text-[var(--color-ink-mid)] mt-0.5 leading-snug">
                {a.body}
              </div>
            </li>
          ))}
        </ul>
      </TerminalPanel>

      <TerminalPanel title="ASSUMPTIONS" raised>
        <ul className="flex flex-col gap-1.5 text-[11.5px] h-mono">
          <Assumption label="Inflation (CPI)" value="4.6%" />
          <Assumption label="Repo Rate" value="5.25%" />
          <Assumption label="Equity μ" value={`${persona.preTaxReturn.toFixed(1)}%`} />
          <Assumption label="Tax slab" value="30% (default)" />
          <Assumption label="Horizon" value={`${persona.retirementAge - persona.age}y to retirement`} />
        </ul>
      </TerminalPanel>

      <TerminalPanel title="CONFIDENCE" raised>
        <div className="flex items-center justify-between">
          <ConfidenceBadge level={persona.confidenceLevel} label={persona.confidenceLabel} />
          <span className="h-tick">model fit</span>
        </div>
        <p className="text-[12px] text-[var(--color-ink-mid)] mt-2 leading-snug">
          Reflects BL posterior tightness, macro forecast uncertainty, and time-horizon sensitivity.
          Higher = more reliable allocation.
        </p>
      </TerminalPanel>
    </aside>
  );
}

function Assumption({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-center justify-between">
      <span className="text-[var(--color-ink-dim)]">{label}</span>
      <span className="text-[var(--color-ink)]">{value}</span>
    </li>
  );
}
