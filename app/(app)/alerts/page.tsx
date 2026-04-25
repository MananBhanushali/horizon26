"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { TerminalPanel } from "@/components/ui/TerminalPanel";
import { PageHeader } from "@/components/PageHeader";
import { buildAlerts } from "@/data/alerts";
import { timeAgo } from "@/lib/format";

const TYPES = ["all", "shortfall", "risk", "macro", "tax"] as const;

export default function AlertsPage() {
  const { persona } = useApp();
  const all = useMemo(() => buildAlerts(persona), [persona]);
  const [filter, setFilter] = useState<typeof TYPES[number]>("all");

  const filtered = filter === "all" ? all : all.filter((a) => a.type === filter);
  const counts = TYPES.reduce<Record<string, number>>((acc, t) => {
    acc[t] = t === "all" ? all.length : all.filter((a) => a.type === t).length;
    return acc;
  }, {});

  const severityColor = {
    critical: "var(--color-warn)",
    warning: "var(--color-amber)",
    info: "var(--color-cyan)",
  } as const;

  return (
    <>
      <PageHeader
        eyebrow="NOTIFICATIONS / ALERTS"
        title="Live event feed"
        subtitle="Risk · shortfall · macro · tax — terminal-style"
      />

      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        {TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`h-mono text-[11px] tracking-wider rounded border px-2.5 py-1.5 ${
              filter === t
                ? "border-[var(--color-cyan-dim)] bg-[var(--color-cyan-soft)] text-[var(--color-cyan)]"
                : "border-[var(--color-edge)] bg-[var(--color-panel)] text-[var(--color-ink-mid)] hover:border-[var(--color-edge-strong)]"
            }`}
          >
            {t.toUpperCase()} <span className="opacity-60 ml-1">{counts[t] ?? 0}</span>
          </button>
        ))}
      </div>

      <TerminalPanel title="EVENT FEED" subtitle="newest first" active>
        <ul className="flex flex-col">
          {filtered.length === 0 && (
            <li className="px-2 py-8 text-center text-sm text-[var(--color-ink-dim)]">No alerts in this category.</li>
          )}
          {filtered.map((a) => (
            <li
              key={a.id}
              className="grid grid-cols-[110px_1fr_120px] gap-3 items-start py-2.5 border-b border-[var(--color-edge)] last:border-b-0"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="h-1.5 w-1.5 rounded-full shrink-0 h-pulse"
                  style={{ background: severityColor[a.severity] }}
                />
                <span
                  className="h-mono text-[10.5px] tracking-wider uppercase"
                  style={{ color: severityColor[a.severity] }}
                >
                  {a.severity}
                </span>
              </div>
              <div className="min-w-0">
                <div className="text-[13px] font-medium">{a.title}</div>
                <div className="text-[12px] text-[var(--color-ink-mid)] mt-0.5 leading-snug">{a.body}</div>
              </div>
              <div className="flex flex-col items-end text-right">
                <span className="h-mono text-[10.5px] tracking-wider uppercase text-[var(--color-ink-mid)]">{a.type}</span>
                <span className="h-tick mt-0.5">{timeAgo(a.timestamp)}</span>
              </div>
            </li>
          ))}
        </ul>
      </TerminalPanel>
    </>
  );
}
