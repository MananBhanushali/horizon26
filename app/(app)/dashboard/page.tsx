"use client";

import { useState } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { TerminalPanel } from "@/components/ui/TerminalPanel";
import { KPIStatCard } from "@/components/ui/KPIStatCard";
import { ProjectionChart } from "@/components/charts/ProjectionChart";
import { ScenarioTag, StatusBadge, ConfidenceBadge } from "@/components/ui/Badges";
import { AllocationDonut, AllocationLegend } from "@/components/charts/AllocationDonut";
import { PageHeader } from "@/components/PageHeader";
import { formatINR, formatPercent } from "@/lib/format";
import Link from "next/link";

export default function DashboardPage() {
  const { persona } = useApp();
  const [scenario, setScenario] = useState<"bull" | "base" | "bear" | null>(null);

  const onTrack = persona.milestones.filter((m) => m.status === "ON_TRACK").length;
  const shorts = persona.milestones.filter((m) => m.status === "SHORTFALL").length;

  return (
    <>
      <PageHeader
        eyebrow={`PERSONA · ${persona.title}`}
        title={
          <span>
            {persona.name}'s plan{" "}
            <span className="text-[var(--color-ink-mid)] font-normal">
              — {persona.tagline}
            </span>
          </span>
        }
        subtitle={`Age ${persona.age} · ${persona.riskBand} · risk score ${persona.riskScore}/100 · ${persona.headlineStatus}`}
        actions={
          <div className="flex items-center gap-2">
            <ConfidenceBadge level={persona.confidenceLevel} label={persona.confidenceLabel} />
            <Link
              href="/sandbox"
              className="h-mono text-xs rounded border border-[var(--color-edge-strong)] bg-[var(--color-panel)] px-3 py-1.5 text-[var(--color-cyan)] hover:border-[var(--color-cyan-dim)]"
            >
              OPEN WHAT-IF →
            </Link>
          </div>
        }
      />

      {/* KPI strip */}
      <section
        aria-label="Key metrics"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4"
      >
        <KPIStatCard
          label="NET WORTH"
          value={formatINR(persona.netWorth, { compact: true })}
          delta={`${persona.monthlyContribution >= 0 ? "+" : ""}${formatINR(persona.monthlyContribution, { compact: true })}/mo`}
          tone="info"
          hint={persona.monthlyContribution >= 0 ? "active SIP" : "drawing SWP"}
          trail={persona.projection.slice(0, 8).map((p) => p.base)}
          size="lg"
        />
        <KPIStatCard
          label={persona.monthlyContribution >= 0 ? "MONTHLY SIP" : "MONTHLY SWP"}
          value={formatINR(Math.abs(persona.monthlyContribution), { compact: true })}
          delta={`across ${persona.instruments.filter((i) => i.monthly > 0).length || persona.instruments.length} instruments`}
          tone="neutral"
          hint={`${formatPercent(persona.allocation.equity, 0)} equity`}
          size="lg"
        />
        <KPIStatCard
          label="PLAN CONFIDENCE"
          value={`${persona.planConfidence}%`}
          delta={persona.confidenceLabel}
          tone={persona.planConfidence >= 75 ? "positive" : persona.planConfidence >= 60 ? "warning" : "negative"}
          hint={`${onTrack} on-track · ${shorts} short`}
          size="lg"
        />
        <KPIStatCard
          label="AGGREGATE GAP"
          value={persona.aggregateShortfall === 0 ? "0" : formatINR(-persona.aggregateShortfall, { compact: true })}
          delta={persona.aggregateShortfall === 0 ? "none" : "remediation available"}
          tone={persona.aggregateShortfall === 0 ? "positive" : "negative"}
          hint={persona.aggregateShortfall === 0 ? "all goals funded" : "see timeline"}
          size="lg"
        />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4 mb-4">
        <TerminalPanel
          title="LIFE PROJECTION · BASE / BULL / BEAR"
          subtitle={`${persona.age} → ${persona.projection[persona.projection.length - 1].age} · scenario band shaded`}
          active
          scanline
          actions={
            <div className="flex items-center gap-1.5">
              {(["bull", "base", "bear"] as const).map((s) => (
                <ScenarioTag key={s} scenario={s} active={scenario === s} onClick={() => setScenario(scenario === s ? null : s)} />
              ))}
            </div>
          }
        >
          <ProjectionChart
            data={persona.projection}
            milestones={persona.milestones}
            startAge={persona.age}
            zoom="ALL"
            highlightScenario={scenario}
          />
          <div className="mt-3 flex items-center gap-4 text-[11px] h-mono text-[var(--color-ink-dim)]">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[var(--color-mint)]" /> Bull</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[var(--color-cyan)]" /> Base</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[var(--color-warn)]" /> Bear</span>
          </div>
        </TerminalPanel>

        <div className="flex flex-col gap-4">
          <TerminalPanel title="ALLOCATION · BL OPTIMIZED" raised>
            <div className="flex flex-col items-center gap-3">
              <AllocationDonut
                allocation={persona.allocation}
                centerValue={`${persona.allocation.equity}%`}
                centerLabel="EQUITY"
              />
              <AllocationLegend allocation={persona.allocation} monthly={Math.max(0, persona.monthlyContribution)} />
            </div>
          </TerminalPanel>

          <TerminalPanel title="NEXT BEST ACTION" raised>
            <NextBestAction />
          </TerminalPanel>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4">
        <TerminalPanel title="MILESTONE SNAPSHOT" subtitle="status sourced from base scenario">
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {persona.milestones.map((m) => (
              <li
                key={m.id}
                className="rounded border border-[var(--color-edge)] bg-[var(--color-panel)] p-3 hover:border-[var(--color-edge-strong)]"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-medium truncate">{m.name}</div>
                  <StatusBadge status={m.status} size="sm" />
                </div>
                <div className="mt-2 flex items-baseline justify-between gap-2 text-xs h-mono">
                  <span className="text-[var(--color-ink-dim)]">@ age {m.age}</span>
                  <span>{formatINR(m.inflatedCost, { compact: true })}</span>
                </div>
                <div className="mt-1.5 flex items-baseline justify-between gap-2 text-[11px] h-mono">
                  <span className="text-[var(--color-ink-dim)]">projected</span>
                  <span className={m.shortfall > 0 ? "text-[var(--color-warn)]" : "text-[var(--color-mint)]"}>
                    {formatINR(m.projectedBalance, { compact: true })}
                  </span>
                </div>
                {m.shortfall > 0 && (
                  <div className="mt-1.5 text-[11px] text-[var(--color-warn)] leading-snug">
                    Gap {formatINR(m.shortfall, { compact: true })}. {m.remediationOptions[0]?.label}.
                  </div>
                )}
              </li>
            ))}
          </ul>
        </TerminalPanel>

        <TerminalPanel title="REASONING TRACE" subtitle="why this allocation">
          <div className="text-[13px] leading-relaxed text-[var(--color-ink)]">
            <p>{persona.reasoningTrace}</p>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
            <Stat label="Capacity" value={persona.riskCapacity} />
            <Stat label="Appetite" value={persona.riskAppetite} />
            <Stat label="Effective" value={persona.riskScore} />
          </div>
          <div className="mt-3 border-t border-[var(--color-edge)] pt-3">
            <div className="h-tick mb-1.5">SENSITIVITY</div>
            <ul className="flex flex-col gap-1.5 text-[12px]">
              {persona.sensitivityAnalysis.slice(0, 3).map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="h-mono text-[var(--color-cyan)] shrink-0">›</span>
                  <span>
                    <span className="text-[var(--color-ink-mid)]">{s.variable}</span>{" "}
                    <span className="h-mono text-[var(--color-amber)]">{s.delta}</span>{" "}
                    <span className="text-[var(--color-ink-mid)]">→</span> {s.impact}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </TerminalPanel>
      </section>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded border border-[var(--color-edge)] bg-[var(--color-panel)] px-2.5 py-2">
      <div className="h-tick">{label}</div>
      <div className="h-mono text-base mt-0.5">{value}</div>
    </div>
  );
}

function NextBestAction() {
  const { persona } = useApp();
  const short = persona.milestones.find((m) => m.status === "SHORTFALL");
  if (short) {
    const opt = short.remediationOptions[0];
    return (
      <div>
        <div className="h-tick text-[var(--color-warn)] mb-2">CRITICAL ACTION</div>
        <div className="text-sm font-medium leading-snug">
          {short.name}: <span className="text-[var(--color-warn)]">{formatINR(short.shortfall, { compact: true })} short</span>
        </div>
        <p className="text-[12px] text-[var(--color-ink-mid)] mt-1.5 leading-snug">
          {short.remediation}
        </p>
        <Link
          href={`/timeline?milestone=${short.id}`}
          className="mt-3 inline-flex items-center gap-2 rounded border border-[var(--color-cyan-dim)] bg-[var(--color-cyan-soft)] px-3 py-1.5 text-xs text-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/15"
        >
          <span className="h-mono">{opt?.label ?? "Explore"}</span> →
        </Link>
      </div>
    );
  }
  return (
    <div>
      <div className="h-tick text-[var(--color-mint)] mb-2">ON TRACK</div>
      <div className="text-sm font-medium leading-snug">All goals funded under base scenario.</div>
      <p className="text-[12px] text-[var(--color-ink-mid)] mt-1.5 leading-snug">
        Maintain SIP discipline. Consider auto step-up to widen the buffer.
      </p>
      <Link
        href="/scenarios"
        className="mt-3 inline-flex items-center gap-2 rounded border border-[var(--color-mint-dim)] bg-[var(--color-mint-soft)] px-3 py-1.5 text-xs text-[var(--color-mint)] hover:bg-[var(--color-mint)]/15"
      >
        <span className="h-mono">View scenarios</span> →
      </Link>
    </div>
  );
}
