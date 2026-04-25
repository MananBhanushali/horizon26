"use client";

import { useApp } from "@/components/providers/AppProvider";
import { TerminalPanel } from "@/components/ui/TerminalPanel";
import { MacroMetricCard } from "@/components/ui/MacroMetricCard";
import { PageHeader } from "@/components/PageHeader";
import { macroSnapshot } from "@/data/macro";

export default function MacroPage() {
  const { persona } = useApp();

  return (
    <>
      <PageHeader
        eyebrow={`MACRO CONTEXT · AS OF ${macroSnapshot.asOf.toUpperCase()}`}
        title="Economic indicators"
        subtitle="Snapshot informs allocation, sensitivity, and dynamic-adjustment triggers"
        actions={
          <span className="h-mono text-[11px] rounded border border-[var(--color-edge)] bg-[var(--color-panel)] px-2 py-1 text-[var(--color-ink-mid)]">
            FIXTURES · {macroSnapshot.asOf}
          </span>
        }
      />

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <MacroMetricCard
          label="RBI REPO"
          value={macroSnapshot.repoRate.value.toFixed(2)}
          unit="%"
          delta={macroSnapshot.repoRate.delta}
          trend={macroSnapshot.repoRate.trend}
          asOf={macroSnapshot.asOf}
          positiveDirection="down"
        />
        <MacroMetricCard
          label="CPI INFLATION"
          value={macroSnapshot.inflation.value.toFixed(2)}
          unit="%"
          delta={macroSnapshot.inflation.delta}
          trend={macroSnapshot.inflation.trend}
          asOf={macroSnapshot.asOf}
          positiveDirection="down"
        />
        <MacroMetricCard
          label="GDP GROWTH"
          value={macroSnapshot.gdpGrowth.value.toFixed(2)}
          unit="%"
          delta={macroSnapshot.gdpGrowth.delta}
          trend={macroSnapshot.gdpGrowth.trend}
          asOf={macroSnapshot.asOf}
          positiveDirection="up"
        />
        <MacroMetricCard
          label="CRUDE (BRENT)"
          value={`$${macroSnapshot.crudeOil.value.toFixed(0)}`}
          unit="/bbl"
          delta={macroSnapshot.crudeOil.delta}
          trend={macroSnapshot.crudeOil.trend}
          asOf={macroSnapshot.asOf}
          positiveDirection="down"
        />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-4">
        <TerminalPanel title="MARKET OUTLOOK" subtitle="consensus" active>
          <p className="text-[13px] leading-relaxed">{macroSnapshot.marketOutlook}</p>
          <div className="mt-3 border-t border-[var(--color-edge)] pt-3">
            <div className="h-tick mb-2">PERSONA IMPACT · {persona.name.toUpperCase()}</div>
            <p className="text-[12.5px] leading-snug text-[var(--color-ink-mid)]">{persona.macroImpact}</p>
          </div>
        </TerminalPanel>

        <TerminalPanel title="DYNAMIC ADJUSTMENT TRIGGERS" subtitle="pre-authored macro reactions">
          <ul className="flex flex-col gap-2">
            {persona.rebalanceTriggers.map((t, i) => (
              <li key={i} className="rounded border border-[var(--color-edge)] bg-[var(--color-panel)] px-3 py-2.5">
                <div className="grid gap-1 sm:grid-cols-[1fr_auto_1fr] sm:items-start">
                  <div>
                    <div className="h-tick">CONDITION</div>
                    <div className="text-[12.5px] mt-0.5">{t.condition}</div>
                  </div>
                  <div className="hidden sm:block h-mono text-[var(--color-cyan)] mt-3">→</div>
                  <div>
                    <div className="h-tick">ACTION</div>
                    <div className="text-[12.5px] mt-0.5 text-[var(--color-cyan)]">{t.action}</div>
                  </div>
                </div>
                <div className="mt-2 border-t border-[var(--color-edge)] pt-2 text-[11.5px] text-[var(--color-ink-mid)] leading-snug">
                  <span className="h-tick">WHY · </span>{t.rationale}
                </div>
              </li>
            ))}
          </ul>
        </TerminalPanel>
      </section>
    </>
  );
}
