"use client";

import { useApp } from "@/components/providers/AppProvider";
import { TerminalPanel } from "@/components/ui/TerminalPanel";
import { EfficientFrontier } from "@/components/charts/EfficientFrontier";
import { PageHeader } from "@/components/PageHeader";
import { ConfidenceBadge } from "@/components/ui/Badges";
import { formatSignedPercent } from "@/lib/format";

export default function BlackLittermanPage() {
  const { persona } = useApp();

  return (
    <>
      <PageHeader
        eyebrow="BLACK-LITTERMAN EXPLAINABILITY"
        title="Why this allocation?"
        subtitle="Equilibrium weights + investor views → posterior returns → mean-variance optimization"
        actions={<ConfidenceBadge level={persona.confidenceLevel} label={persona.confidenceLabel} />}
      />

      <section className="grid grid-cols-1 xl:grid-cols-[1.1fr_1fr] gap-4">
        <TerminalPanel title="EFFICIENT FRONTIER" subtitle="selected portfolio marked in amber" active scanline>
          <EfficientFrontier data={persona.efficientFrontier} selected={persona.selectedFrontierPoint} height={260} />
          <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
            <Mini label="Selected μ" value={`${persona.selectedFrontierPoint.return.toFixed(1)}%`} />
            <Mini label="Selected σ" value={`${persona.selectedFrontierPoint.risk.toFixed(0)}%`} />
            <Mini label="Sharpe (proxy)" value={(persona.selectedFrontierPoint.return / persona.selectedFrontierPoint.risk).toFixed(2)} />
          </div>
        </TerminalPanel>

        <TerminalPanel title="INVESTOR VIEWS" subtitle="overlaid on equilibrium">
          <ul className="flex flex-col gap-2.5">
            {persona.blViews.map((v, i) => (
              <li key={i} className="rounded border border-[var(--color-edge)] bg-[var(--color-panel)] px-3 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-medium">{v.asset}</div>
                  <span
                    className={`h-mono text-[11px] tracking-wider rounded border px-1.5 py-0.5 ${
                      v.view > v.equilibrium
                        ? "border-[var(--color-mint-dim)]/40 bg-[var(--color-mint-soft)] text-[var(--color-mint)]"
                        : v.view < v.equilibrium
                        ? "border-[var(--color-warn-dim)]/40 bg-[var(--color-warn-soft)] text-[var(--color-warn)]"
                        : "border-[var(--color-edge)] text-[var(--color-ink-mid)]"
                    }`}
                  >
                    {formatSignedPercent(v.view - v.equilibrium, 1)} vs eq.
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] h-mono">
                  <Cell label="Equilibrium μ" value={`${v.equilibrium.toFixed(1)}%`} />
                  <Cell label="View μ" value={`${v.view.toFixed(1)}%`} />
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="h-tick">CONFIDENCE</span>
                  <div className="flex-1 h-1.5 rounded bg-[var(--color-base)] overflow-hidden">
                    <div
                      className="h-full bg-[var(--color-cyan)]"
                      style={{ width: `${Math.round(v.confidence * 100)}%` }}
                    />
                  </div>
                  <span className="h-mono text-[11px]">{Math.round(v.confidence * 100)}%</span>
                </div>
                <p className="mt-2 text-[12px] text-[var(--color-ink-mid)] leading-snug">{v.rationale}</p>
              </li>
            ))}
          </ul>
        </TerminalPanel>
      </section>

      <section className="mt-4 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        <TerminalPanel title="WHY THIS ALLOCATION" subtitle="reasoning trace">
          <p className="text-[13px] leading-relaxed text-[var(--color-ink)]">{persona.reasoningTrace}</p>
          <div className="mt-3 border-t border-[var(--color-edge)] pt-3 grid grid-cols-3 gap-2 text-[11px]">
            <Mini label="Risk capacity" value={persona.riskCapacity} />
            <Mini label="Risk appetite" value={persona.riskAppetite} />
            <Mini label="Effective" value={persona.riskScore} />
          </div>
          <div className="mt-3 border-t border-[var(--color-edge)] pt-3">
            <div className="h-tick mb-2">PIPELINE</div>
            <ol className="flex flex-col gap-1.5 text-[12px] text-[var(--color-ink-mid)]">
              <li><span className="h-mono text-[var(--color-cyan)]">1.</span> Market-cap CAPM equilibrium → baseline weights</li>
              <li><span className="h-mono text-[var(--color-cyan)]">2.</span> Investor views overlay (τ = 0.05, ω scaled by view confidence)</li>
              <li><span className="h-mono text-[var(--color-cyan)]">3.</span> Posterior returns blend views + equilibrium</li>
              <li><span className="h-mono text-[var(--color-cyan)]">4.</span> Mean-variance optimization → efficient frontier</li>
              <li><span className="h-mono text-[var(--color-cyan)]">5.</span> Pick risk-appropriate point ({persona.riskScore}/100)</li>
            </ol>
          </div>
        </TerminalPanel>

        <TerminalPanel title="MODEL ASSUMPTIONS">
          <ul className="flex flex-col gap-1.5 text-[12px] h-mono">
            <li className="flex justify-between"><span className="text-[var(--color-ink-dim)]">τ (tau)</span><span>0.05</span></li>
            <li className="flex justify-between"><span className="text-[var(--color-ink-dim)]">Risk-free rate</span><span>5.25%</span></li>
            <li className="flex justify-between"><span className="text-[var(--color-ink-dim)]">Market premium</span><span>6.0%</span></li>
            <li className="flex justify-between"><span className="text-[var(--color-ink-dim)]">Equity σ</span><span>18%</span></li>
            <li className="flex justify-between"><span className="text-[var(--color-ink-dim)]">Debt σ</span><span>4%</span></li>
            <li className="flex justify-between"><span className="text-[var(--color-ink-dim)]">Gold σ</span><span>15%</span></li>
            <li className="flex justify-between"><span className="text-[var(--color-ink-dim)]">Cov source</span><span>2010-2025</span></li>
          </ul>
          <p className="mt-3 text-[11.5px] text-[var(--color-ink-dim)] leading-snug">
            BL optimization runs offline at fixture-authoring time. Shipped app renders results.
          </p>
        </TerminalPanel>
      </section>
    </>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-[var(--color-edge)] bg-[var(--color-base)] px-2 py-1.5">
      <div className="h-tick">{label}</div>
      <div className="mt-0.5">{value}</div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded border border-[var(--color-edge)] bg-[var(--color-panel)] px-2.5 py-2">
      <div className="h-tick">{label}</div>
      <div className="h-mono text-base mt-0.5">{value}</div>
    </div>
  );
}
