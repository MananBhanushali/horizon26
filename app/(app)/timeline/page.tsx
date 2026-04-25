"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useApp } from "@/components/providers/AppProvider";
import { TerminalPanel } from "@/components/ui/TerminalPanel";
import { ProjectionChart } from "@/components/charts/ProjectionChart";
import { StatusBadge } from "@/components/ui/Badges";
import { DrawerPanel } from "@/components/ui/DrawerPanel";
import { AllocationDonut, AllocationLegend } from "@/components/charts/AllocationDonut";
import { PageHeader } from "@/components/PageHeader";
import { formatINR } from "@/lib/format";
import type { Milestone } from "@/lib/types";

const ZOOMS = ["5Y", "10Y", "ALL"] as const;
type Zoom = (typeof ZOOMS)[number];

const categoryIcon: Record<string, string> = {
  education: "🎓",
  home: "🏠",
  wedding: "💍",
  vehicle: "🚗",
  business: "💼",
  retirement: "🛏",
  travel: "✈",
  healthcare: "✚",
  legacy: "★",
  child: "♥",
};

export default function TimelinePage() {
  const { persona } = useApp();
  const params = useSearchParams();
  const [zoom, setZoom] = useState<Zoom>("ALL");
  const [active, setActive] = useState<Milestone | null>(null);

  useEffect(() => {
    const id = params.get("milestone");
    if (id) {
      const m = persona.milestones.find((x) => x.id === id);
      if (m) setActive(m);
    }
  }, [params, persona]);

  // Keyboard nav
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (active) return;
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        const idx = persona.milestones.findIndex((m) => m.id === active);
        const dir = e.key === "ArrowRight" ? 1 : -1;
        const next = persona.milestones[(idx === -1 ? 0 : idx) + dir];
        if (next) setActive(next);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, persona]);

  const sortedMilestones = useMemo(
    () => [...persona.milestones].sort((a, b) => a.age - b.age),
    [persona]
  );

  return (
    <>
      <PageHeader
        eyebrow="TIMELINE & MILESTONES"
        title="Life projection"
        subtitle={`${persona.milestones.length} milestones across ${persona.projection[persona.projection.length - 1].age - persona.age} years`}
        actions={
          <div className="flex items-center gap-1">
            {ZOOMS.map((z) => (
              <button
                key={z}
                onClick={() => setZoom(z)}
                className={`h-mono text-[10px] tracking-wider rounded border px-2 py-1.5 ${
                  zoom === z
                    ? "border-[var(--color-cyan-dim)] bg-[var(--color-cyan-soft)] text-[var(--color-cyan)]"
                    : "border-[var(--color-edge)] bg-[var(--color-panel)] text-[var(--color-ink-mid)] hover:border-[var(--color-edge-strong)]"
                }`}
              >
                {z}
              </button>
            ))}
          </div>
        }
      />

      <TerminalPanel
        title="LIFE PROJECTION"
        subtitle="click a marker to inspect a milestone"
        active
        scanline
      >
        <ProjectionChart
          data={persona.projection}
          milestones={sortedMilestones}
          startAge={persona.age}
          zoom={zoom}
          onMilestoneClick={(m) => setActive(m)}
          height={340}
        />
      </TerminalPanel>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-3">
        {sortedMilestones.map((m) => (
          <button
            key={m.id}
            onClick={() => setActive(m)}
            className="text-left h-panel-raised p-3 hover:border-[var(--color-cyan-dim)]/60 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base shrink-0" aria-hidden>
                  {categoryIcon[m.category] ?? "•"}
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{m.name}</div>
                  <div className="h-tick">@AGE {m.age}</div>
                </div>
              </div>
              <StatusBadge status={m.status} size="sm" />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11.5px] h-mono">
              <Cell label="Nominal" value={formatINR(m.nominalCost, { compact: true })} />
              <Cell label="Inflation-adj." value={formatINR(m.inflatedCost, { compact: true })} />
              <Cell label="Projected" value={formatINR(m.projectedBalance, { compact: true })} />
              <Cell
                label="Gap"
                tone={m.shortfall > 0 ? "warn" : "ok"}
                value={m.shortfall > 0 ? formatINR(-m.shortfall, { compact: true }) : "0"}
              />
            </div>
          </button>
        ))}
      </div>

      <DrawerPanel
        open={!!active}
        onClose={() => setActive(null)}
        title={active?.name ?? ""}
        subtitle={active ? `Milestone @ age ${active.age} · ${active.category}` : undefined}
        footer={
          active && (
            <div className="flex items-center justify-between gap-3">
              <span className="h-tick">REMEDIATION</span>
              <button className="h-mono text-xs rounded border border-[var(--color-cyan-dim)] bg-[var(--color-cyan-soft)] px-3 py-1.5 text-[var(--color-cyan)]">
                APPLY {active.remediationOptions[0]?.label ?? ""} →
              </button>
            </div>
          )
        }
      >
        {active && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <StatusBadge status={active.status} />
              {active.shortfall > 0 && (
                <span className="h-mono text-xs text-[var(--color-warn)]">
                  {formatINR(-active.shortfall, { compact: true })} short
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs h-mono">
              <Cell label="Nominal cost" value={formatINR(active.nominalCost, { compact: true })} />
              <Cell label="Inflation-adj." value={formatINR(active.inflatedCost, { compact: true })} />
              <Cell label="Projected balance" value={formatINR(active.projectedBalance, { compact: true })} />
              <Cell
                label="Gap"
                tone={active.shortfall > 0 ? "warn" : "ok"}
                value={active.shortfall > 0 ? formatINR(-active.shortfall, { compact: true }) : "0"}
              />
            </div>

            <div className="border-t border-[var(--color-edge)] pt-3">
              <div className="h-tick mb-2">BUCKET ALLOCATION (proximity-based)</div>
              <div className="flex items-center gap-3">
                <AllocationDonut allocation={active.bucket} size={140} thickness={16} centerValue={`${active.bucket.equity}%`} centerLabel="EQUITY" />
                <div className="flex-1">
                  <AllocationLegend allocation={active.bucket} />
                </div>
              </div>
            </div>

            <div className="border-t border-[var(--color-edge)] pt-3">
              <div className="h-tick mb-2">REMEDIATION OPTIONS</div>
              <ul className="flex flex-col gap-2">
                {active.remediationOptions.map((o, i) => (
                  <li key={i} className="rounded border border-[var(--color-edge)] bg-[var(--color-panel)] px-3 py-2">
                    <div className="text-sm font-medium">{o.label}</div>
                    <div className="text-[11.5px] text-[var(--color-ink-mid)] mt-0.5">{o.impact}</div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-[var(--color-edge)] pt-3">
              <div className="h-tick mb-2">NARRATIVE</div>
              <p className="text-[13px] leading-relaxed text-[var(--color-ink-mid)]">{active.remediation}</p>
            </div>
          </div>
        )}
      </DrawerPanel>
    </>
  );
}

function Cell({ label, value, tone }: { label: string; value: string; tone?: "ok" | "warn" }) {
  const cls = tone === "warn" ? "text-[var(--color-warn)]" : tone === "ok" ? "text-[var(--color-mint)]" : "";
  return (
    <div className="rounded border border-[var(--color-edge)] bg-[var(--color-panel)] px-2.5 py-1.5">
      <div className="h-tick">{label}</div>
      <div className={`h-mono text-[13px] mt-0.5 ${cls}`}>{value}</div>
    </div>
  );
}
