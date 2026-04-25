"use client";

import { useApp } from "@/components/providers/AppProvider";
import { TerminalPanel } from "@/components/ui/TerminalPanel";
import { AllocationDonut, AllocationLegend, allocationPalette } from "@/components/charts/AllocationDonut";
import { GlidePathChart } from "@/components/charts/GlidePathChart";
import { ConfidenceBadge } from "@/components/ui/Badges";
import { PageHeader } from "@/components/PageHeader";
import { formatINR, formatPercent } from "@/lib/format";

export default function AllocationPage() {
  const { persona } = useApp();
  const monthlySIP = Math.max(0, persona.monthlyContribution);

  const buckets: { label: string; key: keyof typeof allocationPalette }[] = [
    { label: "Equity", key: "equity" },
    { label: "Debt", key: "debt" },
    { label: "Gold", key: "gold" },
    { label: "Liquid", key: "liquid" },
  ];

  return (
    <>
      <PageHeader
        eyebrow="ALLOCATION INTELLIGENCE"
        title="Asset mix · BL optimized"
        subtitle="Equity / Debt / Gold / Liquid split with proximity-based glide path"
        actions={<ConfidenceBadge level={persona.confidenceLevel} label={persona.confidenceLabel} />}
      />

      <section className="grid grid-cols-1 xl:grid-cols-[1.1fr_1fr] gap-4">
        <TerminalPanel title="CURRENT ALLOCATION" subtitle={`Monthly basis: ${formatINR(monthlySIP, { compact: true })}`} active>
          <div className="grid grid-cols-1 sm:grid-cols-[260px_1fr] items-center gap-5">
            <div className="grid place-items-center">
              <AllocationDonut
                allocation={persona.allocation}
                size={240}
                thickness={26}
                centerValue={`${persona.allocation.equity}%`}
                centerLabel="EQUITY CORE"
              />
            </div>
            <div className="flex flex-col gap-3">
              <AllocationLegend allocation={persona.allocation} monthly={monthlySIP} />
              <div className="rounded border border-[var(--color-edge)] bg-[var(--color-panel)] px-3 py-2.5">
                <div className="h-tick mb-1">WHY THIS MIX</div>
                <p className="text-[12.5px] leading-snug text-[var(--color-ink-mid)]">
                  {persona.reasoningTrace}
                </p>
              </div>
            </div>
          </div>
        </TerminalPanel>

        <TerminalPanel title="GLIDE PATH" subtitle="how allocation shifts as goals approach">
          <GlidePathChart data={persona.glidePath} height={220} />
          <div className="mt-3 flex flex-wrap gap-3 text-[11px] h-mono text-[var(--color-ink-dim)]">
            {buckets.map((b) => (
              <span key={b.key} className="flex items-center gap-1.5">
                <span className="h-2 w-3 rounded-sm" style={{ background: allocationPalette[b.key] }} />
                {b.label}
              </span>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
            {[persona.glidePath[0], persona.glidePath[Math.floor(persona.glidePath.length / 2)], persona.glidePath[persona.glidePath.length - 1]].map((g) => (
              <div key={g.age} className="rounded border border-[var(--color-edge)] bg-[var(--color-panel)] px-2.5 py-2">
                <div className="h-tick">@ AGE {g.age}</div>
                <div className="h-mono text-[12px] mt-1">
                  {g.equity}/{g.debt}/{g.gold}/{g.liquid}
                </div>
              </div>
            ))}
          </div>
        </TerminalPanel>
      </section>

      <section className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TerminalPanel title="BUCKET DETAIL">
          <ul className="flex flex-col gap-2">
            {buckets.map((b) => {
              const pct = persona.allocation[b.key];
              const monthly = (pct / 100) * monthlySIP;
              return (
                <li key={b.key} className="rounded border border-[var(--color-edge)] bg-[var(--color-panel)] px-3 py-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="h-2.5 w-2.5 rounded-sm" style={{ background: allocationPalette[b.key] }} />
                      <span className="text-sm font-medium">{b.label}</span>
                    </div>
                    <div className="h-mono text-sm">
                      {formatPercent(pct, 0)}{" "}
                      <span className="text-[var(--color-ink-dim)] text-[11px]">·</span>{" "}
                      <span className="text-[var(--color-ink-mid)] text-[12px]">{formatINR(monthly, { compact: true })}/mo</span>
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 rounded bg-[var(--color-base)] overflow-hidden">
                    <div className="h-full rounded" style={{ width: `${pct}%`, background: allocationPalette[b.key], opacity: 0.85 }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </TerminalPanel>

        <TerminalPanel title="CONFIDENCE BREAKDOWN">
          <div className="flex items-baseline gap-3">
            <div className="h-mono text-3xl">{persona.confidenceLevel}%</div>
            <ConfidenceBadge level={persona.confidenceLevel} label={persona.confidenceLabel} />
          </div>
          <p className="mt-2 text-[12.5px] text-[var(--color-ink-mid)] leading-snug">
            Composite of BL posterior tightness, macro forecast uncertainty, and time-horizon sensitivity.
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
            <Mini label="Model fit" value={Math.min(100, persona.confidenceLevel + 4)} />
            <Mini label="Macro" value={Math.max(40, persona.confidenceLevel - 12)} />
            <Mini label="Horizon" value={Math.max(50, persona.confidenceLevel - 6)} />
          </div>
        </TerminalPanel>
      </section>
    </>
  );
}

function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded border border-[var(--color-edge)] bg-[var(--color-panel)] px-2.5 py-2">
      <div className="h-tick">{label}</div>
      <div className="h-mono text-base mt-0.5">{value}%</div>
      <div className="mt-1 h-1 rounded bg-[var(--color-base)] overflow-hidden">
        <div className="h-full bg-[var(--color-cyan)]" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
