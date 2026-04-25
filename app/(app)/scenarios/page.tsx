"use client";

import { useState } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { TerminalPanel } from "@/components/ui/TerminalPanel";
import { ProjectionChart } from "@/components/charts/ProjectionChart";
import { ScenarioTag } from "@/components/ui/Badges";
import { PageHeader } from "@/components/PageHeader";
import { formatINR, formatSignedPercent } from "@/lib/format";

export default function ScenariosPage() {
  const { persona } = useApp();
  const [highlight, setHighlight] = useState<"bull" | "base" | "bear" | null>(null);

  const tone = (id: "bull" | "base" | "bear") =>
    id === "bull" ? "var(--color-mint)" : id === "base" ? "var(--color-cyan)" : "var(--color-warn)";

  return (
    <>
      <PageHeader
        eyebrow="SCENARIO COMPARISON"
        title="Bull · Base · Bear"
        subtitle="Three parallel simulations from BL-implied base case"
      />

      <TerminalPanel
        title="PROJECTION BAND"
        subtitle="hover any scenario tag to highlight"
        active
        scanline
        actions={
          <div className="flex items-center gap-1.5">
            {(["bull", "base", "bear"] as const).map((s) => (
              <ScenarioTag
                key={s}
                scenario={s}
                active={highlight === s}
                onClick={() => setHighlight(highlight === s ? null : s)}
              />
            ))}
          </div>
        }
      >
        <ProjectionChart
          data={persona.projection}
          milestones={persona.milestones}
          startAge={persona.age}
          zoom="ALL"
          highlightScenario={highlight}
          height={300}
        />
      </TerminalPanel>

      <section className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        {persona.scenarios.map((s) => (
          <div
            key={s.id}
            className={`h-panel-raised flex flex-col gap-3 p-4 ${highlight === s.id ? "h-panel-active" : ""}`}
            onMouseEnter={() => setHighlight(s.id)}
            onMouseLeave={() => setHighlight(null)}
          >
            <div className="flex items-center justify-between">
              <ScenarioTag scenario={s.id} active />
              <span className="h-mono text-[11px]" style={{ color: tone(s.id) }}>
                {(s.hitRate * 100).toFixed(0)}% hit
              </span>
            </div>
            <div>
              <div className="h-tick">END CORPUS</div>
              <div className="h-mono text-2xl mt-1" style={{ color: tone(s.id) }}>
                {formatINR(s.endCorpus, { compact: true })}
              </div>
              <div className="h-mono text-[11.5px] mt-0.5">
                <span className="text-[var(--color-ink-dim)]">vs base</span>{" "}
                <span style={{ color: tone(s.id) }}>
                  {s.shortfallDelta > 0 ? "+" : ""}
                  {formatINR(s.shortfallDelta, { compact: true })}
                </span>
              </div>
            </div>
            <p className="text-[12.5px] leading-snug text-[var(--color-ink-mid)]">{s.description}</p>
            <div className="rounded border border-[var(--color-edge)] bg-[var(--color-base)] px-2.5 py-2">
              <div className="h-tick mb-1">KEY RISK</div>
              <p className="text-[12px] leading-snug text-[var(--color-ink)]">{s.keyRisk}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TerminalPanel title="MILESTONE HIT-RATE BY SCENARIO">
          <div className="grid grid-cols-[1fr_repeat(3,72px)] gap-1 text-[11.5px] h-mono">
            <div className="h-tick">MILESTONE</div>
            <div className="h-tick text-[var(--color-mint)] text-right">BULL</div>
            <div className="h-tick text-[var(--color-cyan)] text-right">BASE</div>
            <div className="h-tick text-[var(--color-warn)] text-right">BEAR</div>
            {persona.milestones.map((m) => (
              <RowSet key={m.id} m={m} />
            ))}
          </div>
        </TerminalPanel>
        <TerminalPanel title="SHORTFALL DELTA · BEAR vs BASE">
          <DeltaBars scenarios={persona.scenarios} />
          <p className="mt-3 text-[12px] text-[var(--color-ink-mid)] leading-snug">
            Bear-vs-base delta is the most useful guardrail: it shows how exposed the plan is to a downside outcome before remediation.
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
            {persona.scenarios.map((s) => (
              <div key={s.id} className="rounded border border-[var(--color-edge)] bg-[var(--color-panel)] px-2.5 py-2">
                <div className="h-tick" style={{ color: tone(s.id) }}>{s.label.toUpperCase()}</div>
                <div className="h-mono text-base mt-0.5">{formatSignedPercent(((s.endCorpus - persona.scenarios.find((x) => x.id === "base")!.endCorpus) / persona.scenarios.find((x) => x.id === "base")!.endCorpus) * 100, 0)}</div>
              </div>
            ))}
          </div>
        </TerminalPanel>
      </section>
    </>
  );
}

function RowSet({ m }: { m: { id: string; name: string; status: string } }) {
  // simulate: ON_TRACK in bull, status in base, often SHORTFALL in bear
  const bull = m.status === "ON_TRACK" || m.status === "SURPLUS" ? "✓" : "≈";
  const base = m.status === "SHORTFALL" ? "✗" : m.status === "SURPLUS" ? "✓✓" : "✓";
  const bear = m.status === "SHORTFALL" ? "✗✗" : m.status === "ON_TRACK" ? "≈" : "✓";
  const cell = (s: string, color: string) => (
    <div className="text-right">
      <span className="h-mono" style={{ color }}>{s}</span>
    </div>
  );
  return (
    <>
      <div className="text-[12px] truncate">{m.name}</div>
      {cell(bull, "var(--color-mint)")}
      {cell(base, "var(--color-cyan)")}
      {cell(bear, "var(--color-warn)")}
    </>
  );
}

function DeltaBars({ scenarios }: { scenarios: { id: string; endCorpus: number; label: string }[] }) {
  const max = Math.max(...scenarios.map((s) => s.endCorpus));
  return (
    <ul className="flex flex-col gap-2.5">
      {scenarios.map((s) => {
        const pct = (s.endCorpus / max) * 100;
        const color = s.id === "bull" ? "var(--color-mint)" : s.id === "base" ? "var(--color-cyan)" : "var(--color-warn)";
        return (
          <li key={s.id}>
            <div className="flex items-center justify-between text-[12px] mb-1">
              <span className="h-mono" style={{ color }}>{s.label}</span>
              <span className="h-mono">{formatINR(s.endCorpus, { compact: true })}</span>
            </div>
            <div className="h-2.5 rounded bg-[var(--color-base)] overflow-hidden">
              <div className="h-full" style={{ width: `${pct}%`, background: color, opacity: 0.85 }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
