"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useApp, type UserFinances } from "@/components/providers/AppProvider";
import type { LivePlan } from "@/lib/livePlan";
import { formatINR } from "@/lib/format";

export default function DashboardPage() {
  const {
    persona,
    finances,
    updateFinances,
    resetFinances,
    livePlan,
    needsFinancesOnboarding,
    markFinancesOnboarded,
  } = useApp();
  const firstName = persona.name.split(" ")[0];
  const [editingFinances, setEditingFinances] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const params = useSearchParams();
  const router = useRouter();

  // First-visit onboarding: open the editor once, mark done whether they save or skip.
  useEffect(() => {
    if (needsFinancesOnboarding) {
      setShowOnboarding(true);
    }
  }, [needsFinancesOnboarding]);

  // ?edit=money auto-opens the editor (sidebar deep link / "edit" actions)
  useEffect(() => {
    if (params.get("edit") === "money") {
      setEditingFinances(true);
      router.replace("/dashboard");
    }
  }, [params, router]);

  return (
    <div className="flex flex-col gap-5">
      {/* Greeting */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Hello, {firstName}</h1>
        <p className="text-sm text-[var(--color-ink-mid)] mt-1">
          {finances.customized
            ? "Your numbers, live plan, all synced."
            : "Tell us how money flows in and out each month — everything else updates from there."}
        </p>
      </div>

      {/* PRIMARY: Your money this month — income / expenses / savings */}
      <FinancesHero
        finances={finances}
        onEdit={() => setEditingFinances(true)}
        onReset={() => resetFinances()}
      />

      {editingFinances && (
        <FinancesEditor
          mode="edit"
          initial={finances}
          onCancel={() => setEditingFinances(false)}
          onSave={(next) => {
            updateFinances(next);
            setEditingFinances(false);
          }}
        />
      )}

      {showOnboarding && !editingFinances && (
        <FinancesEditor
          mode="onboarding"
          initial={finances}
          onCancel={() => {
            // Skip: mark prompted so we don't ask again.
            markFinancesOnboarded();
            setShowOnboarding(false);
          }}
          onSave={(next) => {
            updateFinances(next);
            markFinancesOnboarded();
            setShowOnboarding(false);
          }}
        />
      )}

      {/* Plan summary — uses live plan, recomputed from finances */}
      <PlanSummary persona={persona} finances={finances} livePlan={livePlan} />

      {/* Net worth + Allocation buckets */}
      <section className="grid grid-cols-1 xl:grid-cols-[1.1fr_1fr] gap-5">
        <NetWorthCard persona={persona} finances={finances} livePlan={livePlan} />
        <AllocationCards persona={persona} />
      </section>

      {/* Goals + Instruments — both driven by live plan */}
      <section className="grid grid-cols-1 xl:grid-cols-[1.1fr_1fr] gap-5">
        <MilestoneSnapshot livePlan={livePlan} />
        <Instruments livePlan={livePlan} customized={finances.customized} />
      </section>
    </div>
  );
}

/* -------------------- Finances hero (income / expenses / savings) -------------------- */
function FinancesHero({
  finances,
  onEdit,
  onReset,
}: {
  finances: UserFinances;
  onEdit: () => void;
  onReset: () => void;
}) {
  const { monthlyIncome, monthlyExpenses, monthlySavings, customized } = finances;
  const savingsRate =
    monthlyIncome > 0 ? Math.round((monthlySavings / monthlyIncome) * 100) : 0;
  const isDrawing = monthlySavings < 0;

  // Health rating: <5% needs work, 5-15% getting started, 15-30% solid, >30% excellent
  let healthLabel = "";
  let healthColor = "";
  if (isDrawing) {
    healthLabel = "Drawing down";
    healthColor = "var(--color-warn-dim)";
  } else if (savingsRate < 5) {
    healthLabel = "Tight";
    healthColor = "var(--color-warn-dim)";
  } else if (savingsRate < 15) {
    healthLabel = "Getting started";
    healthColor = "var(--color-amber-dim)";
  } else if (savingsRate < 30) {
    healthLabel = "Solid";
    healthColor = "var(--color-mint-dim)";
  } else {
    healthLabel = "Excellent";
    healthColor = "var(--color-mint-dim)";
  }

  return (
    <section className="rounded-3xl bg-white border border-[var(--color-edge)] p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
        <div>
          <div className="text-base md:text-lg font-semibold tracking-tight">
            Your money this month
          </div>
          <div className="text-xs text-[var(--color-ink-dim)] mt-0.5">
            {customized
              ? "Your numbers — used everywhere in the app."
              : "Sample numbers from this profile. Edit to use yours."}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {customized && (
            <button
              onClick={onReset}
              className="text-[11px] text-[var(--color-ink-mid)] hover:text-[var(--color-ink)] underline-offset-2 hover:underline"
            >
              Reset to sample
            </button>
          )}
          <button
            onClick={onEdit}
            className="rounded-full bg-[var(--color-pill-dark)] text-white px-5 py-2 text-sm font-medium hover:opacity-90 flex items-center gap-2"
          >
            <PencilIcon /> {customized ? "Edit" : "Enter your numbers"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <FinancesTile
          label="Income"
          value={monthlyIncome}
          subtitle="What you take home"
          tone="neutral"
          icon={<ArrowDownIn />}
        />
        <FinancesTile
          label="Expenses"
          value={monthlyExpenses}
          subtitle="Rent, food, bills, lifestyle"
          tone="neutral"
          icon={<ArrowUpOut />}
        />
        <FinancesTile
          label={isDrawing ? "Drawing down" : "Going to savings"}
          value={Math.abs(monthlySavings)}
          subtitle={
            isDrawing
              ? "Pulled from corpus each month"
              : `${savingsRate}% savings rate · ${healthLabel}`
          }
          tone={isDrawing ? "warn" : "ok"}
          icon={<PiggyIcon />}
          highlight
        />
      </div>

      {!isDrawing && monthlyIncome > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-[11px] text-[var(--color-ink-dim)] mb-1.5">
            <span>Savings rate</span>
            <span style={{ color: healthColor }} className="font-medium">
              {savingsRate}% · {healthLabel}
            </span>
          </div>
          <div className="h-2 rounded-full bg-[var(--color-grid)] overflow-hidden">
            <div
              className="h-full rounded-full transition-[width] duration-300"
              style={{
                width: `${Math.min(100, Math.max(0, savingsRate))}%`,
                background: healthColor,
              }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[10px] text-[var(--color-ink-faint)]">
            <span>0%</span>
            <span>15% solid</span>
            <span>30%+ excellent</span>
          </div>
        </div>
      )}
    </section>
  );
}

function FinancesTile({
  label,
  value,
  subtitle,
  tone,
  icon,
  highlight,
}: {
  label: string;
  value: number;
  subtitle: string;
  tone: "neutral" | "ok" | "warn";
  icon: React.ReactNode;
  highlight?: boolean;
}) {
  const valueColor =
    tone === "warn"
      ? "var(--color-warn-dim)"
      : tone === "ok"
      ? "var(--color-mint-dim)"
      : "var(--color-ink)";
  return (
    <div
      className={`rounded-2xl p-4 ${
        highlight
          ? "bg-[var(--color-lavender-soft)]"
          : "bg-[var(--color-grid)]"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-medium text-[var(--color-ink-mid)]">{label}</div>
        <span
          className="grid place-items-center h-7 w-7 rounded-full bg-white text-[var(--color-ink)]"
          aria-hidden
        >
          {icon}
        </span>
      </div>
      <div className="text-3xl font-semibold tracking-tight tabular-nums" style={{ color: valueColor }}>
        ₹{compact(value)}
      </div>
      <div className="text-[11px] text-[var(--color-ink-dim)] mt-1 leading-snug">{subtitle}</div>
    </div>
  );
}

/* -------------------- Finances editor dialog -------------------- */
function FinancesEditor({
  initial,
  onCancel,
  onSave,
  mode = "edit",
}: {
  initial: UserFinances;
  onCancel: () => void;
  onSave: (next: Partial<UserFinances>) => void;
  mode?: "onboarding" | "edit";
}) {
  const [income, setIncome] = useState(initial.monthlyIncome);
  const [expenses, setExpenses] = useState(initial.monthlyExpenses);
  const [savings, setSavings] = useState(initial.monthlySavings);
  const [emergencyFund, setEmergencyFund] = useState(initial.emergencyFund);
  const [autoSavings, setAutoSavings] = useState(true);

  const derivedSavings = income - expenses;
  const effectiveSavings = autoSavings ? derivedSavings : savings;
  const savingsRate = income > 0 ? Math.round((effectiveSavings / income) * 100) : 0;

  const isOnboarding = mode === "onboarding";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-xl max-h-[92vh] overflow-auto">
        {isOnboarding && (
          <div className="mb-4 rounded-2xl bg-[var(--color-lavender-soft)] px-4 py-3 text-xs leading-relaxed text-[var(--color-ink)]">
            👋 <strong>One-time setup.</strong> Plug in your monthly numbers and we'll wire them
            into every screen — goal funding, projections, instrument splits. You can edit anytime
            from the dashboard or the sidebar's "My money".
          </div>
        )}
        <div className="text-lg font-semibold tracking-tight">
          {isOnboarding ? "Let's start with your monthly numbers" : "Edit your monthly numbers"}
        </div>
        <div className="text-xs text-[var(--color-ink-dim)] mt-1 leading-relaxed">
          We'll use these everywhere — projections, goal funding, allocation. Stays in your browser
          only; nothing leaves your device.
        </div>

        <div className="mt-5 flex flex-col gap-4">
          <NumberField
            label="Monthly income (take-home)"
            help="After tax. Salary, freelance, rent received — whatever lands in your account."
            value={income}
            onChange={setIncome}
            placeholder="e.g. 80000"
          />
          <NumberField
            label="Monthly expenses"
            help="Rent / EMI, food, bills, transport, lifestyle, anything you spend."
            value={expenses}
            onChange={setExpenses}
            placeholder="e.g. 50000"
          />

          <div className="rounded-2xl bg-[var(--color-grid)] p-4">
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={autoSavings}
                onChange={(e) => setAutoSavings(e.target.checked)}
                className="accent-[var(--color-pill-dark)]"
              />
              <span>
                Calculate savings automatically as <b>income − expenses</b>
              </span>
            </label>

            {autoSavings ? (
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-xs text-[var(--color-ink-mid)]">Going to savings</span>
                <span
                  className="text-2xl font-semibold tabular-nums"
                  style={{
                    color:
                      derivedSavings < 0
                        ? "var(--color-warn-dim)"
                        : "var(--color-mint-dim)",
                  }}
                >
                  ₹{compact(Math.abs(derivedSavings))}
                  {derivedSavings < 0 && (
                    <span className="text-xs text-[var(--color-warn-dim)] ml-2 font-normal">
                      drawing down
                    </span>
                  )}
                </span>
              </div>
            ) : (
              <div className="mt-3">
                <NumberField
                  label="Monthly savings (override)"
                  help="Leave negative if you're drawing from your corpus rather than adding."
                  value={savings}
                  onChange={setSavings}
                  allowNegative
                  placeholder="e.g. 30000"
                  compact
                />
              </div>
            )}

            {income > 0 && effectiveSavings >= 0 && (
              <div className="mt-3 text-[11px] text-[var(--color-ink-dim)]">
                Savings rate:{" "}
                <span
                  className="font-semibold"
                  style={{
                    color:
                      savingsRate >= 15
                        ? "var(--color-mint-dim)"
                        : savingsRate >= 5
                        ? "var(--color-amber-dim)"
                        : "var(--color-warn-dim)",
                  }}
                >
                  {savingsRate}%
                </span>
              </div>
            )}
          </div>

          <NumberField
            label="Emergency fund (current cash buffer)"
            help="Money you can grab inside 24 hours. Aim for 3–6 months of expenses."
            value={emergencyFund}
            onChange={setEmergencyFund}
            placeholder="e.g. 200000"
          />
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-full bg-[var(--color-grid)] px-4 py-2 text-xs font-medium text-[var(--color-ink-mid)]"
          >
            {isOnboarding ? "Use sample numbers for now" : "Cancel"}
          </button>
          <button
            onClick={() =>
              onSave({
                monthlyIncome: income,
                monthlyExpenses: expenses,
                monthlySavings: autoSavings ? derivedSavings : savings,
                emergencyFund,
              })
            }
            className="rounded-full bg-[var(--color-pill-dark)] px-5 py-2 text-xs font-medium text-white"
          >
            {isOnboarding ? "Save and continue" : "Save my numbers"}
          </button>
        </div>
      </div>
    </div>
  );
}

function NumberField({
  label,
  help,
  value,
  onChange,
  placeholder,
  allowNegative,
  compact: compactInput,
}: {
  label: string;
  help?: string;
  value: number;
  onChange: (n: number) => void;
  placeholder?: string;
  allowNegative?: boolean;
  compact?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--color-ink-dim)]">
        {label}
      </span>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-ink-mid)]">
          ₹
        </span>
        <input
          type="number"
          inputMode="numeric"
          step={1000}
          min={allowNegative ? undefined : 0}
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => onChange(Number(e.target.value))}
          placeholder={placeholder}
          className={`w-full rounded-xl border ${
            compactInput ? "" : "bg-white"
          } border-[var(--color-edge)] bg-white pl-7 pr-3 py-2.5 text-base tabular-nums focus:border-[var(--color-cyan)] focus:outline-none`}
        />
      </div>
      {help && (
        <span className="text-[10px] text-[var(--color-ink-dim)] leading-relaxed">{help}</span>
      )}
    </label>
  );
}

/* -------------------- Plain-English summary -------------------- */
function PlanSummary({
  persona,
  finances,
  livePlan,
}: {
  persona: ReturnType<typeof useApp>["persona"];
  finances: UserFinances;
  livePlan: LivePlan;
}) {
  const monthly = finances.monthlySavings;
  const yearsLeft = persona.retirementAge - persona.age;

  const shorts = livePlan.milestones.filter((m) => m.statusLive === "SHORTFALL");
  const onTrack = livePlan.milestones.filter(
    (m) => m.statusLive === "ON_TRACK" || m.statusLive === "SURPLUS"
  );

  let headline: string;
  let detail: string;
  let tone: "ok" | "warn";
  if (shorts.length === 0) {
    tone = "ok";
    headline = `On track. All ${livePlan.milestones.length} goals look fundable.`;
    detail =
      monthly >= 0
        ? `Keep saving ₹${compact(monthly)}/month and by age ${persona.retirementAge} you'll have around ₹${compact(livePlan.finalCorpus)}.`
        : `Drawing ₹${compact(Math.abs(monthly))}/month. Your corpus supports the spend through your projection horizon.`;
  } else {
    tone = "warn";
    const worst = [...shorts].sort((a, b) => b.shortfallLive - a.shortfallLive)[0];
    headline = `${shorts.length} of ${livePlan.milestones.length} goals are short by ₹${compact(livePlan.aggregateShortfall)}.`;
    detail = `Biggest gap: ${worst.name} at age ${worst.age} is ₹${compact(worst.shortfallLive)} short. Try saving more, or push the goal later.`;
  }

  return (
    <div
      className="rounded-3xl p-6 flex flex-col md:flex-row md:items-center gap-4 md:gap-6"
      style={{
        background:
          tone === "ok"
            ? "linear-gradient(135deg, var(--color-mint-soft) 0%, #ffffff 80%)"
            : "linear-gradient(135deg, var(--color-warn-soft) 0%, #ffffff 80%)",
      }}
    >
      <div
        className="grid place-items-center h-12 w-12 rounded-2xl text-white shrink-0"
        style={{
          background: tone === "ok" ? "var(--color-mint-dim)" : "var(--color-warn-dim)",
        }}
      >
        {tone === "ok" ? <CheckIcon /> : <AlertIcon />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-base md:text-lg font-semibold tracking-tight leading-snug">
          {headline}
        </div>
        <div className="text-sm text-[var(--color-ink-mid)] mt-1 leading-relaxed">{detail}</div>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-[var(--color-ink-dim)]">
          <span>
            <span className="text-[var(--color-mint-dim)] font-semibold">●</span>{" "}
            {onTrack.length} on track
          </span>
          <span>
            <span className="text-[var(--color-warn-dim)] font-semibold">●</span>{" "}
            {shorts.length} short
          </span>
          <span>·</span>
          <span>{yearsLeft} yrs to retirement</span>
        </div>
      </div>
      <Link
        href="/timeline"
        className="rounded-full bg-[var(--color-pill-dark)] text-white px-5 py-2.5 text-sm font-medium hover:opacity-90 shrink-0"
      >
        Open timeline →
      </Link>
    </div>
  );
}

/* -------------------- Net worth -------------------- */
function NetWorthCard({
  persona,
  finances,
  livePlan,
}: {
  persona: ReturnType<typeof useApp>["persona"];
  finances: UserFinances;
  livePlan: LivePlan;
}) {
  const monthly = finances.monthlySavings;
  return (
    <div className="h-card-lavender p-7">
      <div className="text-center">
        <div className="text-sm text-[var(--color-ink-mid)]">Net worth</div>
        <div className="mt-1 text-5xl font-semibold tracking-tight tabular-nums">
          ₹{compact(persona.netWorth)}
        </div>
        <div className="mt-1 text-xs text-[var(--color-ink-mid)]">
          {monthly >= 0
            ? `Adding ₹${compact(monthly)}/month`
            : `Drawing ₹${compact(Math.abs(monthly))}/month`}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-4 gap-3">
        <ActionButton label="Timeline" href="/timeline" icon={<TimelineIcon />} />
        <ActionButton label="Try changes" href="/timeline" icon={<RefreshIcon />} />
        <ActionButton label="Allocation" href="/allocation" icon={<DonutIcon />} />
        <ActionButton label="Tax" href="/tax" icon={<ReceiptIcon />} />
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 text-center">
        <Stat label="Plan health" value={`${persona.planConfidence}%`} hint="confidence" />
        <Stat
          label="Risk score"
          value={`${persona.riskScore}/100`}
          hint={persona.riskBand.split("-")[0]}
        />
        <Stat
          label="Funding gap"
          value={livePlan.aggregateShortfall === 0 ? "₹0" : `₹${compact(livePlan.aggregateShortfall)}`}
          tone={livePlan.aggregateShortfall === 0 ? "ok" : "warn"}
          hint={livePlan.aggregateShortfall === 0 ? "all goals" : "across goals"}
        />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "ok" | "warn";
}) {
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
      <div className="text-sm font-semibold mt-0.5 tabular-nums" style={{ color }}>
        {value}
      </div>
      {hint && <div className="text-[10px] text-[var(--color-ink-dim)]">{hint}</div>}
    </div>
  );
}

function ActionButton({
  label,
  href,
  icon,
}: {
  label: string;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <Link href={href} className="flex flex-col items-center gap-2">
      <span className="h-circle-dark h-12 w-12">{icon}</span>
      <span className="text-xs text-[var(--color-ink)]">{label}</span>
    </Link>
  );
}

/* -------------------- Allocation buckets -------------------- */
function AllocationCards({ persona }: { persona: ReturnType<typeof useApp>["persona"] }) {
  const buckets = [
    {
      label: "Equity",
      pct: persona.allocation.equity,
      tone: "lavender" as const,
      sub: "Long-term growth",
      explain: "Stocks. Higher returns over decades, swings in the short term.",
    },
    {
      label: "Debt",
      pct: persona.allocation.debt,
      tone: "white" as const,
      sub: "Stability anchor",
      explain: "Bonds and fixed income. Predictable income, lower volatility.",
    },
    {
      label: "Gold",
      pct: persona.allocation.gold,
      tone: "white" as const,
      sub: "Inflation hedge",
      explain: "Holds value when inflation rises or rupee weakens.",
    },
    {
      label: "Liquid",
      pct: persona.allocation.liquid,
      tone: "white" as const,
      sub: "Emergency cushion",
      explain: "Cash-like funds. Available within 24 hours.",
    },
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
          explain={b.explain}
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
  explain,
  tone,
}: {
  label: string;
  pct: number;
  amount: number;
  sub: string;
  explain: string;
  tone: "white" | "lavender";
}) {
  const isLavender = tone === "lavender";
  return (
    <Link
      href="/allocation"
      title={explain}
      className={`shrink-0 snap-start w-[200px] rounded-3xl p-5 flex flex-col justify-between min-h-[180px] transition-shadow hover:shadow-md ${
        isLavender ? "h-card-lavender" : "bg-white border border-[var(--color-edge)]"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="text-xs font-medium text-[var(--color-ink-mid)]">{sub}</div>
        <span className="text-[var(--color-ink-mid)]">
          <DotsIcon />
        </span>
      </div>
      <div>
        <div className="text-xs text-[var(--color-ink-mid)]">{label}</div>
        <div className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">
          ₹{compact(amount)}
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-[var(--color-ink-mid)]">
        <span className="text-[var(--color-ink)] font-semibold">{pct}%</span>
        <span>of portfolio</span>
      </div>
    </Link>
  );
}

/* -------------------- Instruments -------------------- */
function Instruments({
  livePlan,
  customized,
}: {
  livePlan: LivePlan;
  customized: boolean;
}) {
  const items = livePlan.scaledInstruments.slice(0, 5);
  const total = livePlan.scaledInstruments.reduce((acc, i) => acc + i.monthly, 0);
  const colors: Record<string, string> = {
    Equity: "#a3aef5",
    Debt: "#34c08a",
    Gold: "#f0a93f",
    Liquid: "#c8c8ff",
  };

  return (
    <div className="h-panel p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-2xl font-semibold tracking-tight">What you're buying</div>
          <div className="text-xs text-[var(--color-ink-dim)] mt-0.5">
            {total > 0
              ? `Recommended split of your ₹${compact(total)}/month savings`
              : customized
              ? "You're not adding to investments this month."
              : "Recommended monthly investments"}
          </div>
        </div>
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
            title={inst.rationale}
          >
            <span
              className="grid place-items-center h-11 w-11 rounded-full text-sm font-semibold text-white shrink-0"
              style={{ background: colors[inst.category] ?? "#c8c8ff" }}
            >
              {inst.category.charAt(0)}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{inst.name}</div>
              <div className="text-xs text-[var(--color-ink-dim)]">
                {inst.subCategory} · {inst.taxBenefit}
              </div>
            </div>
            <div className="text-sm font-semibold tabular-nums text-right">
              ₹{compact(inst.monthly)}
              <span className="text-[10px] text-[var(--color-ink-dim)] font-normal block">
                per month
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* -------------------- Goals snapshot -------------------- */
function MilestoneSnapshot({ livePlan }: { livePlan: LivePlan }) {
  const sorted = [...livePlan.milestones].sort((a, b) => a.age - b.age).slice(0, 5);

  return (
    <div className="h-panel p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-2xl font-semibold tracking-tight">Your goals</div>
          <div className="text-xs text-[var(--color-ink-dim)] mt-0.5">
            Funding live-computed from your savings
          </div>
        </div>
        <Link
          href="/timeline"
          className="text-xs text-[var(--color-ink-mid)] hover:text-[var(--color-ink)]"
        >
          Open timeline →
        </Link>
      </div>

      <ul className="flex flex-col gap-3">
        {sorted.map((m) => {
          const pct = Math.min(
            100,
            Math.round((m.projectedBalanceLive / Math.max(1, m.inflatedCost)) * 100)
          );
          const onTrack = m.statusLive === "ON_TRACK" || m.statusLive === "SURPLUS";
          const tone = onTrack ? "var(--color-mint-dim)" : "var(--color-warn-dim)";
          return (
            <li key={m.id} className="rounded-2xl bg-[var(--color-grid)] p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-medium truncate">
                  {m.name}{" "}
                  <span className="text-[var(--color-ink-dim)] font-normal">
                    · age {m.age}
                  </span>
                </div>
                <div className="text-xs font-semibold tabular-nums" style={{ color: tone }}>
                  {onTrack ? `${Math.min(pct, 999)}% funded` : `−₹${compact(m.shortfallLive)}`}
                </div>
              </div>
              <div className="mt-2 h-2 rounded-full bg-white overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(100, pct)}%`,
                    background: tone,
                  }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-[var(--color-ink-dim)]">
                <span>Cost when due: ₹{compact(m.inflatedCost)}</span>
                <span>Projected: ₹{compact(m.projectedBalanceLive)}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* -------------------- helpers + icons -------------------- */
function compact(n: number): string {
  return formatINR(n, { compact: true }).replace("Rs. ", "");
}

function CheckIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 12 5 5L20 7" />
    </svg>
  );
}
function AlertIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 9v4M12 17h.01" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}
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
function DonutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function ReceiptIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 3v18l2-1.5L9 21l2-1.5L13 21l2-1.5L17 21l2-1.5V3" />
      <path d="M8 8h8M8 12h8M8 16h5" />
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
function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}
function ArrowDownIn() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14" />
      <path d="m6 13 6 6 6-6" />
    </svg>
  );
}
function ArrowUpOut() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19V5" />
      <path d="m6 11 6-6 6 6" />
    </svg>
  );
}
function PiggyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 8a3 3 0 0 0-3 3v.5h-.5a5 5 0 0 0-9.5 2.5v3a3 3 0 0 0 1 2.2V21h3v-1.5h5V21h3v-1.8A5 5 0 0 0 21 14v-3a3 3 0 0 0-2-2Z" />
      <circle cx="12" cy="13" r="0.6" fill="currentColor" />
    </svg>
  );
}
