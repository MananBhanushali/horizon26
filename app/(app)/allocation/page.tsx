"use client";

import { useMemo } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { TerminalPanel } from "@/components/ui/TerminalPanel";
import { AllocationDonut, AllocationLegend, allocationPalette } from "@/components/charts/AllocationDonut";
import { GlidePathChart } from "@/components/charts/GlidePathChart";
import { ConfidenceBadge } from "@/components/ui/Badges";
import { PageHeader } from "@/components/PageHeader";
import { formatINR, formatPercent } from "@/lib/format";
import { calculateAllocationMetrics, MARKET_BENCHMARK } from "@/lib/portfolioMetrics";

export default function AllocationPage() {
  const { persona, finances } = useApp();
  const monthlySIP = Math.max(0, finances.monthlySavings);

  const metrics = useMemo(
    () => calculateAllocationMetrics(persona.allocation, persona.preTaxReturn),
    [persona.allocation, persona.preTaxReturn]
  );

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
        <TerminalPanel title="Current allocation" subtitle={`Monthly basis: ${formatINR(monthlySIP, { compact: true })}`} active>
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
                <p className="text-[12.5px] leading-snug text-[var(--color-ink)]">
                  {persona.reasoningTrace}
                </p>
              </div>
            </div>
          </div>
        </TerminalPanel>

        <TerminalPanel title="GLIDE PATH" subtitle="how allocation shifts as goals approach">
          <GlidePathChart data={persona.glidePath} height={220} />
          <div className="mt-3 flex flex-wrap gap-3 text-[11px] h-mono text-[var(--color-ink)]">
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
                      <span className="text-[var(--color-ink)] text-[11px]">·</span>{" "}
                      <span className="text-[var(--color-ink)] text-[12px]">{formatINR(monthly, { compact: true })}/mo</span>
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
          <p className="mt-2 text-[12.5px] text-[var(--color-ink)] leading-snug">
            Composite of BL posterior tightness, macro forecast uncertainty, and time-horizon sensitivity.
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
            <Mini label="Model fit" value={Math.min(100, persona.confidenceLevel + 4)} />
            <Mini label="Macro" value={Math.max(40, persona.confidenceLevel - 12)} />
            <Mini label="Horizon" value={Math.max(50, persona.confidenceLevel - 6)} />
          </div>
        </TerminalPanel>
      </section>

      <section className="mt-4">
        <TerminalPanel
          title="PORTFOLIO QUANTITATIVE FACTORS &amp; RISK PROFILE"
          subtitle={`Benchmark: ${MARKET_BENCHMARK.name} · Risk-Free Rate: ${MARKET_BENCHMARK.riskFreeRate}%`}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-center">
            <div className="rounded border border-[var(--color-edge)] bg-[var(--color-panel)] p-3">
              <div className="h-tick text-[10px]">PORTFOLIO BETA (β)</div>
              <div className="h-mono text-xl font-bold mt-1 text-[var(--color-ink)]">{metrics.beta}</div>
              <div className="text-[10px] text-[var(--color-ink-dim)] mt-0.5">
                {metrics.beta < 0.8 ? "Conservative" : metrics.beta > 1.15 ? "Aggressive" : "Neutral"}
              </div>
            </div>
            <div className="rounded border border-[var(--color-edge)] bg-[var(--color-panel)] p-3">
              <div className="h-tick text-[10px]">EXPECTED CAGR</div>
              <div className="h-mono text-xl font-bold mt-1 text-[var(--color-mint-dim)]">{metrics.cagr}%</div>
              <div className="text-[10px] text-[var(--color-ink-dim)] mt-0.5">Annual compound</div>
            </div>
            <div className="rounded border border-[var(--color-edge)] bg-[var(--color-panel)] p-3">
              <div className="h-tick text-[10px]">JENSEN'S ALPHA (α)</div>
              <div className={`h-mono text-xl font-bold mt-1 ${metrics.alpha >= 0 ? "text-[var(--color-mint-dim)]" : "text-[var(--color-warn-dim)]"}`}>
                {metrics.alpha >= 0 ? `+${metrics.alpha}%` : `${metrics.alpha}%`}
              </div>
              <div className="text-[10px] text-[var(--color-ink-dim)] mt-0.5">vs CAPM model</div>
            </div>
            <div className="rounded border border-[var(--color-edge)] bg-[var(--color-panel)] p-3">
              <div className="h-tick text-[10px]">SHARPE RATIO</div>
              <div className="h-mono text-xl font-bold mt-1 text-[var(--color-cyan)]">{metrics.sharpeRatio}</div>
              <div className="text-[10px] text-[var(--color-ink-dim)] mt-0.5">Risk-adjusted</div>
            </div>
            <div className="rounded border border-[var(--color-edge)] bg-[var(--color-panel)] p-3">
              <div className="h-tick text-[10px]">SORTINO RATIO</div>
              <div className="h-mono text-xl font-bold mt-1 text-[var(--color-ink)]">{metrics.sortinoRatio}</div>
              <div className="text-[10px] text-[var(--color-ink-dim)] mt-0.5">Downside metric</div>
            </div>
            <div className="rounded border border-[var(--color-edge)] bg-[var(--color-panel)] p-3">
              <div className="h-tick text-[10px]">EST. MAX DD</div>
              <div className="h-mono text-xl font-bold mt-1 text-[var(--color-warn-dim)]">{metrics.maxDrawdown}%</div>
              <div className="text-[10px] text-[var(--color-ink-dim)] mt-0.5">Peak-to-trough</div>
            </div>
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
