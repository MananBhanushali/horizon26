"use client";

import { useState } from "react";
import Link from "next/link";
import { useApp } from "@/components/providers/AppProvider";
import { personas } from "@/data/personas";
import { formatINR, formatPercent } from "@/lib/format";

export default function DashboardPage() {
  const { persona, personaId, setPersonaId } = useApp();
  const [period, setPeriod] = useState<"weekly" | "monthly">("weekly");

  const firstName = persona.name.split(" ")[0];

  return (
    <div className="flex flex-col gap-5">
      {/* Greeting */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Hello, {firstName}!</h1>
        <p className="text-sm text-[var(--color-ink-mid)] mt-1">
          {persona.tagline} — {persona.headlineStatus}.
        </p>
      </div>

      {/* Net worth + Allocation buckets */}
      <section className="grid grid-cols-1 xl:grid-cols-[1.1fr_1fr] gap-5">
        <NetWorthCard persona={persona} />
        <AllocationCards persona={persona} />
      </section>

      {/* Persona switcher (Quick transfer style) + Statistics */}
      <section className="grid grid-cols-1 xl:grid-cols-[1.1fr_1fr] gap-5">
        <PersonaRow personaId={personaId} setPersonaId={setPersonaId} />
        <ProjectionStats persona={persona} period={period} setPeriod={setPeriod} />
      </section>

      {/* Instruments + Goals */}
      <section className="grid grid-cols-1 xl:grid-cols-[1.1fr_1fr] gap-5">
        <Instruments persona={persona} />
        <MilestoneSnapshot persona={persona} />
      </section>
    </div>
  );
}

/* -------------------- Net worth -------------------- */
function NetWorthCard({ persona }: { persona: ReturnType<typeof useApp>["persona"] }) {
  const monthly = persona.monthlyContribution;
  return (
    <div className="h-card-lavender p-7">
      <div className="text-center">
        <div className="text-sm text-[var(--color-ink-mid)]">Net worth</div>
        <div className="mt-1 text-5xl font-semibold tracking-tight">
          {formatINR(persona.netWorth, { compact: true }).replace("Rs.", "₹")}
        </div>
        <div className="mt-1 text-xs text-[var(--color-ink-mid)]">
          {monthly >= 0
            ? `+${formatINR(monthly, { compact: true }).replace("Rs.", "₹")}/mo SIP active`
            : `${formatINR(monthly, { compact: true }).replace("Rs.", "₹")}/mo SWP drawing`}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-4 gap-3">
        <ActionButton label="Timeline" href="/timeline" icon={<TimelineIcon />} />
        <ActionButton label="What-if" href="/sandbox" icon={<RefreshIcon />} />
        <ActionButton label="Find SIP" href="/scenarios" icon={<TargetIcon />} />
        <ActionButton label="Add goal" href="/timeline" icon={<PlusIcon />} />
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 text-center">
        <Stat label="Plan confidence" value={`${persona.planConfidence}%`} />
        <Stat label="Risk score" value={`${persona.riskScore}/100`} />
        <Stat
          label="Aggregate gap"
          value={
            persona.aggregateShortfall === 0
              ? "₹0"
              : formatINR(-persona.aggregateShortfall, { compact: true }).replace("Rs.", "₹")
          }
          tone={persona.aggregateShortfall === 0 ? "ok" : "warn"}
        />
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "ok" | "warn" }) {
  const color =
    tone === "warn"
      ? "var(--color-warn-dim)"
      : tone === "ok"
      ? "var(--color-mint-dim)"
      : "var(--color-ink)";
  return (
    <div className="rounded-2xl bg-white/60 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-[var(--color-ink-dim)]">
        {label}
      </div>
      <div className="text-sm font-semibold mt-0.5" style={{ color }}>
        {value}
      </div>
    </div>
  );
}

function ActionButton({ label, href, icon }: { label: string; href: string; icon: React.ReactNode }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-2">
      <span className="h-circle-dark h-12 w-12">{icon}</span>
      <span className="text-xs text-[var(--color-ink)]">{label}</span>
    </Link>
  );
}

/* -------------------- Allocation buckets (VISA-style cards) -------------------- */
function AllocationCards({ persona }: { persona: ReturnType<typeof useApp>["persona"] }) {
  const buckets = [
    { label: "Equity", pct: persona.allocation.equity, tone: "lavender" as const, sub: "Long-term growth" },
    { label: "Debt", pct: persona.allocation.debt, tone: "white" as const, sub: "Stability anchor" },
    { label: "Gold", pct: persona.allocation.gold, tone: "white" as const, sub: "Inflation hedge" },
    { label: "Liquid", pct: persona.allocation.liquid, tone: "white" as const, sub: "Cushion" },
  ];

  return (
    <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 snap-x">
      {buckets.map((b) => (
        <BucketCard
          key={b.label}
          label={b.label}
          pct={b.pct}
          amount={persona.netWorth * (b.pct / 100)}
          sub={b.sub}
          tone={b.tone}
        />
      ))}
    </div>
  );
}

function BucketCard({
  label,
  pct,
  amount,
  sub,
  tone,
}: {
  label: string;
  pct: number;
  amount: number;
  sub: string;
  tone: "white" | "lavender";
}) {
  const isLavender = tone === "lavender";
  return (
    <div
      className={`shrink-0 snap-start w-[200px] rounded-3xl p-5 flex flex-col justify-between min-h-[180px] ${
        isLavender ? "h-card-lavender" : "bg-white border border-[var(--color-edge)]"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="text-xs font-medium text-[var(--color-ink-mid)]">{sub}</div>
        <Link href="/allocation" className="text-[var(--color-ink-mid)]" aria-label="More">
          <DotsIcon />
        </Link>
      </div>
      <div>
        <div className="text-xs text-[var(--color-ink-mid)]">{label}</div>
        <div className="mt-1 text-2xl font-semibold tracking-tight">
          {formatINR(amount, { compact: true }).replace("Rs.", "₹")}
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-[var(--color-ink-mid)]">
        <span className="text-[var(--color-ink)] font-semibold">{pct}%</span>
        <span>BL · v1</span>
      </div>
    </div>
  );
}

/* -------------------- Persona row (Quick-transfer-style) -------------------- */
function PersonaRow({
  personaId,
  setPersonaId,
}: {
  personaId: string;
  setPersonaId: (id: any) => void;
}) {
  const colors = ["#a8d5ba", "#f5c89a", "#e3b3d4", "#a3aef5", "#b8e0d2", "#c8c8ff"];
  return (
    <div className="h-panel p-6">
      <div className="text-2xl font-semibold tracking-tight mb-4">Switch persona</div>
      <div className="rounded-2xl bg-[var(--color-grid)] p-4 flex items-center gap-4 overflow-x-auto">
        {personas.map((p, i) => {
          const active = p.id === personaId;
          return (
            <button
              key={p.id}
              onClick={() => setPersonaId(p.id)}
              className="flex flex-col items-center gap-2 shrink-0"
              title={p.title}
            >
              <span
                className={`grid place-items-center h-12 w-12 rounded-full text-sm font-semibold text-white ${
                  active ? "ring-2 ring-[var(--color-pill-dark)] ring-offset-2 ring-offset-[var(--color-grid)]" : ""
                }`}
                style={{ background: colors[i % colors.length] }}
              >
                {p.name.charAt(0)}
              </span>
              <span
                className={`text-xs ${
                  active ? "text-[var(--color-ink)] font-semibold" : "text-[var(--color-ink-mid)]"
                }`}
              >
                {p.name.split(" ")[0]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------- Projection bars -------------------- */
function ProjectionStats({
  persona,
  period,
  setPeriod,
}: {
  persona: ReturnType<typeof useApp>["persona"];
  period: "weekly" | "monthly";
  setPeriod: (p: "weekly" | "monthly") => void;
}) {
  // 7 evenly spaced ages from current → retirement
  const totalYears = persona.retirementAge - persona.age;
  const step = Math.max(1, Math.floor(totalYears / 6));
  const samples: { age: number; bull: number; base: number; bear: number }[] = [];
  for (let i = 0; i < 7; i++) {
    const age = persona.age + i * step;
    const pt = persona.projection.find((p) => p.age >= age) ?? persona.projection[persona.projection.length - 1];
    samples.push({ age, bull: pt.bull, base: pt.base, bear: pt.bear });
  }
  const max = Math.max(...samples.map((s) => s.bull));
  const finalBase = samples[samples.length - 1].base;

  return (
    <div className="h-panel p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="text-2xl font-semibold tracking-tight">Projection</div>
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-[var(--color-grid)] p-1 flex gap-1">
            <button
              onClick={() => setPeriod("weekly")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                period === "weekly"
                  ? "bg-[var(--color-pill-dark)] text-white"
                  : "text-[var(--color-ink-mid)]"
              }`}
            >
              Bull
            </button>
            <button
              onClick={() => setPeriod("monthly")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                period === "monthly"
                  ? "bg-[var(--color-pill-dark)] text-white"
                  : "text-[var(--color-ink-mid)]"
              }`}
            >
              Bear
            </button>
          </div>
          <Link
            href="/timeline"
            className="grid place-items-center h-9 w-9 rounded-full bg-[var(--color-pill-dark)] text-white"
            title="Open timeline"
          >
            <BarsIcon />
          </Link>
        </div>
      </div>

      <div className="mt-5 rounded-2xl bg-[var(--color-grid)] p-5">
        <div className="flex items-center justify-between">
          <div className="text-xs text-[var(--color-ink-mid)]">
            At age {persona.retirementAge} (base)
          </div>
          <Link
            href="/timeline"
            className="rounded-full bg-white px-3 py-1.5 text-xs font-medium flex items-center gap-1.5"
          >
            Details <ArrowUpRight />
          </Link>
        </div>

        <div className="mt-3 text-3xl font-semibold tracking-tight">
          {formatINR(finalBase, { compact: true }).replace("Rs.", "₹")}
        </div>

        <div className="mt-4 flex items-end justify-between gap-2 h-[140px]">
          {samples.map((s, i) => {
            const baseH = (s.base / max) * 100;
            const high = period === "weekly" ? s.bull : s.bear;
            const highH = (high / max) * 100;
            return (
              <div key={i} className="flex flex-col items-center gap-2 flex-1">
                <div className="flex items-end gap-1 h-[110px] w-full justify-center">
                  <div
                    className="w-3.5 rounded-t-full bg-[var(--color-lavender-deep)]"
                    style={{ height: `${baseH}%` }}
                  />
                  <div
                    className="w-3.5 rounded-t-full bg-[var(--color-pill-dark)]"
                    style={{ height: `${highH}%` }}
                  />
                </div>
                <span className="text-[11px] text-[var(--color-ink-mid)]">{s.age}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* -------------------- Instruments -------------------- */
function Instruments({ persona }: { persona: ReturnType<typeof useApp>["persona"] }) {
  const items = persona.instruments.slice(0, 5);
  const colors: Record<string, string> = {
    Equity: "#a3aef5",
    Debt: "#34c08a",
    Gold: "#f0a93f",
    Liquid: "#c8c8ff",
  };

  return (
    <div className="h-panel p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="text-2xl font-semibold tracking-tight">Instruments</div>
        <Link
          href="/instruments"
          className="text-xs text-[var(--color-ink-mid)] hover:text-[var(--color-ink)]"
        >
          View all →
        </Link>
      </div>

      <ul className="flex flex-col gap-3">
        {items.map((inst) => (
          <li
            key={inst.id}
            className="flex items-center gap-4 rounded-2xl bg-[var(--color-grid)] px-4 py-3"
          >
            <span
              className="grid place-items-center h-11 w-11 rounded-full text-sm font-semibold text-white shrink-0"
              style={{ background: colors[inst.category] ?? "#c8c8ff" }}
            >
              {inst.category.charAt(0)}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{inst.name}</div>
              <div className="text-xs text-[var(--color-ink-mid)]">
                {inst.subCategory} · {inst.taxBenefit}
              </div>
            </div>
            <div className="text-sm font-semibold">
              {formatINR(inst.monthly, { compact: true }).replace("Rs.", "₹")}
              <span className="text-[10px] text-[var(--color-ink-mid)] font-normal">/mo</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* -------------------- Milestones snapshot -------------------- */
function MilestoneSnapshot({ persona }: { persona: ReturnType<typeof useApp>["persona"] }) {
  return (
    <div className="h-panel p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="text-2xl font-semibold tracking-tight">Goals</div>
        <Link href="/timeline" className="text-xs text-[var(--color-ink-mid)] hover:text-[var(--color-ink)]">
          Timeline →
        </Link>
      </div>

      <ul className="flex flex-col gap-3">
        {persona.milestones.slice(0, 4).map((m) => {
          const pct = Math.min(
            100,
            Math.round((m.projectedBalance / Math.max(1, m.inflatedCost)) * 100)
          );
          const tone =
            m.status === "ON_TRACK" || m.status === "SURPLUS"
              ? "var(--color-mint-dim)"
              : "var(--color-warn)";
          return (
            <li key={m.id} className="rounded-2xl bg-[var(--color-grid)] p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-medium truncate">{m.name}</div>
                <div className="text-xs font-semibold" style={{ color: tone }}>
                  {pct}%
                </div>
              </div>
              <div className="mt-2 h-2 rounded-full bg-white overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, background: tone }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-[var(--color-ink-mid)]">
                <span>@ age {m.age}</span>
                <span>{formatINR(m.inflatedCost, { compact: true }).replace("Rs.", "₹")}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* -------------------- Icons -------------------- */
function TimelineIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M3 12h18" />
      <circle cx="7" cy="12" r="2" fill="currentColor" />
      <circle cx="13" cy="12" r="2" fill="currentColor" />
      <circle cx="19" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}
function RefreshIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M21 4v4h-4" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" /><path d="M3 20v-4h4" />
    </svg>
  );
}
function TargetIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function DotsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="6" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="12" cy="18" r="1.6" />
    </svg>
  );
}
function BarsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M6 18V10M12 18V6M18 18v-6" />
    </svg>
  );
}
function ArrowUpRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17 17 7" /><path d="M8 7h9v9" />
    </svg>
  );
}
