"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { TerminalPanel } from "@/components/ui/TerminalPanel";
import { ProjectionChart } from "@/components/charts/ProjectionChart";
import { PageHeader } from "@/components/PageHeader";
import { KPIStatCard } from "@/components/ui/KPIStatCard";
import { buildProjection } from "@/data/projection";
import { formatINR, formatPercent } from "@/lib/format";

export default function SandboxPage() {
  const { persona, finances } = useApp();
  const baseSIP = Math.max(0, finances.monthlySavings);

  const [sip, setSip] = useState(baseSIP);
  const [inflation, setInflation] = useState(5.5);
  const [appetite, setAppetite] = useState(persona.riskAppetite);

  const baseReturn = useMemo(() => {
    const tilt = (appetite - persona.riskAppetite) * 0.05;
    return Math.max(4, persona.preTaxReturn + tilt);
  }, [appetite, persona]);

  const proj = useMemo(
    () =>
      buildProjection({
        startAge: persona.age,
        endAge: persona.projection[persona.projection.length - 1].age,
        startBalance: persona.netWorth,
        monthlySIP: sip,
        baseReturn,
        milestoneDrawdowns: persona.milestones.map((m) => ({
          age: m.age,
          nominal: m.nominalCost,
          inflation: inflation / 100,
        })),
      }),
    [sip, baseReturn, inflation, persona]
  );

  const finalCorpus = proj[proj.length - 1].base;
  const baseFinal = persona.projection[persona.projection.length - 1].base;
  const delta = finalCorpus - baseFinal;

  const presets: Record<string, { sip: number; inflation?: number; appetite?: number; label: string }[]> = {
    aditya: [
      { label: "32K SIP", sip: 32000 },
      { label: "48K SIP", sip: 48000 },
      { label: "+ Home loan", sip: 32000 - 10000 },
    ],
    riya: [
      { label: "1.5K SIP", sip: 1500 },
      { label: "Step-up to 5K", sip: 5000 },
    ],
    priya: [
      { label: "55K SIP", sip: 55000 },
      { label: "67K SIP (close gap)", sip: 67000 },
    ],
    vikram: [
      { label: "40K SIP", sip: 40000 },
      { label: "55K SIP", sip: 55000 },
    ],
    raj: [
      { label: "75K SIP", sip: 75000 },
      { label: "100K SIP", sip: 100000 },
    ],
    sharma: [
      { label: "0 (drawing)", sip: 0 },
    ],
  };
  const personaPresets = presets[persona.id] ?? presets.aditya;

  return (
    <>
      <PageHeader
        eyebrow="WHAT-IF SANDBOX"
        title="Adjust assumptions"
        subtitle="Sliders animate between precomputed states. v1 reuses the offline simulator."
      />

      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-4">
        <TerminalPanel title="LIVE PROJECTION" subtitle="changes update the curve in real time" active scanline>
          <ProjectionChart
            data={proj}
            milestones={persona.milestones}
            startAge={persona.age}
            zoom="ALL"
            height={300}
          />
          <div className="mt-3 grid grid-cols-2 lg:grid-cols-4 gap-2 text-[11px]">
            <Stat label="Final corpus" value={formatINR(finalCorpus, { compact: true })} tone="info" />
            <Stat label="vs base" value={`${delta >= 0 ? "+" : ""}${formatINR(delta, { compact: true })}`} tone={delta >= 0 ? "ok" : "warn"} />
            <Stat label="SIP" value={formatINR(sip, { compact: true })} />
            <Stat label="μ" value={`${baseReturn.toFixed(1)}%`} />
          </div>
        </TerminalPanel>

        <TerminalPanel title="CONTROLS" subtitle="three knobs">
          <div className="flex flex-col gap-5">
            <Slider
              label="Monthly SIP"
              hint={formatINR(sip)}
              min={0}
              max={Math.max(150000, baseSIP * 2)}
              step={500}
              value={sip}
              onChange={setSip}
            />
            <Slider
              label="Inflation"
              hint={`${inflation.toFixed(1)}%`}
              min={2}
              max={9}
              step={0.1}
              value={inflation}
              onChange={setInflation}
            />
            <Slider
              label="Risk appetite"
              hint={`${appetite}/100`}
              min={20}
              max={100}
              step={1}
              value={appetite}
              onChange={setAppetite}
            />
          </div>

          <div className="mt-5 border-t border-[var(--color-edge)] pt-3">
            <div className="h-tick mb-2">PRESETS · {persona.name.toUpperCase()}</div>
            <div className="flex flex-wrap gap-1.5">
              {personaPresets.map((p) => (
                <button
                  key={p.label}
                  onClick={() => {
                    setSip(p.sip);
                    if (p.inflation !== undefined) setInflation(p.inflation);
                    if (p.appetite !== undefined) setAppetite(p.appetite);
                  }}
                  className="h-mono text-[11px] rounded border border-[var(--color-edge)] bg-[var(--color-panel)] px-2.5 py-1.5 text-[var(--color-ink-mid)] hover:border-[var(--color-cyan-dim)] hover:text-[var(--color-cyan)]"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 border-t border-[var(--color-edge)] pt-3 text-[12px] text-[var(--color-ink-mid)] leading-snug">
            v1 sandbox uses the offline simulator. P1 wires this directly into the monthly engine for sub-150 ms recompute.
          </div>
        </TerminalPanel>
      </div>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
        <KPIStatCard
          label="ASSUMED μ"
          value={`${baseReturn.toFixed(1)}%`}
          tone="info"
          delta={`${formatPercent(baseReturn - persona.preTaxReturn, 1)} vs baseline`}
        />
        <KPIStatCard
          label="ASSUMED INFLATION"
          value={`${inflation.toFixed(1)}%`}
          tone="warning"
          delta={inflation > 5.5 ? "elevated" : "moderate"}
        />
        <KPIStatCard
          label="MONTHLY SIP"
          value={formatINR(sip, { compact: true })}
          tone="positive"
          delta={`${sip > baseSIP ? "+" : ""}${formatINR(sip - baseSIP, { compact: true })} vs baseline`}
        />
        <KPIStatCard
          label="RISK APPETITE"
          value={`${appetite}/100`}
          tone="neutral"
          delta={`${appetite - persona.riskAppetite >= 0 ? "+" : ""}${appetite - persona.riskAppetite} vs baseline`}
        />
      </section>

      <div className="mt-4 sticky bottom-2 lg:bottom-4 z-20">
        <div className="h-panel-raised flex flex-wrap items-center justify-between gap-3 px-4 py-2.5">
          <div className="h-tick">CHANGED ASSUMPTIONS VS BASELINE</div>
          <div className="flex items-center gap-3 text-[11.5px] h-mono">
            <Diff label="SIP" delta={sip - baseSIP} fmt={(v) => formatINR(v)} />
            <Diff label="Inflation" delta={inflation - 5.5} fmt={(v) => `${v.toFixed(1)}pp`} />
            <Diff label="Appetite" delta={appetite - persona.riskAppetite} fmt={(v) => `${v}`} />
            <button
              onClick={() => {
                setSip(baseSIP);
                setInflation(5.5);
                setAppetite(persona.riskAppetite);
              }}
              className="h-mono text-[11px] rounded border border-[var(--color-edge)] bg-[var(--color-panel)] px-2.5 py-1 text-[var(--color-ink-mid)] hover:border-[var(--color-edge-strong)]"
            >
              RESET
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function Slider({
  label,
  hint,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <label className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="h-tick">{label}</span>
        <span className="h-mono text-[12px] text-[var(--color-cyan)]">{hint}</span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--color-cyan)] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[var(--color-base)] [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[var(--color-cyan)]"
          style={{
            background: `linear-gradient(to right, var(--color-cyan) 0%, var(--color-cyan) ${pct}%, var(--color-edge) ${pct}%, var(--color-edge) 100%)`,
            height: 4,
            borderRadius: 4,
          }}
        />
      </div>
      <div className="flex items-center justify-between text-[10px] text-[var(--color-ink-dim)] h-mono">
        <span>{typeof min === "number" && min < 1000 ? min : (min / 1000).toFixed(0) + "K"}</span>
        <span>{typeof max === "number" && max < 1000 ? max : (max / 1000).toFixed(0) + "K"}</span>
      </div>
    </label>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "info" | "ok" | "warn" }) {
  const cls = tone === "info" ? "text-[var(--color-cyan)]" : tone === "ok" ? "text-[var(--color-mint)]" : tone === "warn" ? "text-[var(--color-warn)]" : "";
  return (
    <div className="rounded border border-[var(--color-edge)] bg-[var(--color-panel)] px-2.5 py-1.5">
      <div className="h-tick">{label}</div>
      <div className={`h-mono text-[13px] mt-0.5 ${cls}`}>{value}</div>
    </div>
  );
}

function Diff({ label, delta, fmt }: { label: string; delta: number; fmt: (v: number) => string }) {
  if (Math.abs(delta) < 1e-6) {
    return (
      <span className="text-[var(--color-ink-dim)]">
        {label} <span className="text-[var(--color-ink)]">±0</span>
      </span>
    );
  }
  return (
    <span className="text-[var(--color-ink-dim)]">
      {label}{" "}
      <span className={delta > 0 ? "text-[var(--color-mint)]" : "text-[var(--color-warn)]"}>
        {delta > 0 ? "+" : ""}
        {fmt(delta)}
      </span>
    </span>
  );
}
