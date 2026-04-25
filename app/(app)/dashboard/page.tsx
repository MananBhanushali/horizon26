"use client";

import { useState } from "react";
import Link from "next/link";
import { useApp } from "@/components/providers/AppProvider";
import { formatINR } from "@/lib/format";

export default function DashboardPage() {
  const { persona, session } = useApp();
  const [period, setPeriod] = useState<"weekly" | "monthly">("weekly");

  const firstName = persona.name.split(" ")[0];

  return (
    <div className="flex flex-col gap-5">
      {/* Greeting */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Hello, {firstName}!</h1>
          <p className="text-sm text-[var(--color-ink-mid)] mt-1">
            All information about your account in the sections below.
          </p>
        </div>
      </div>

      {/* Top row: Available balance + Cards */}
      <section className="grid grid-cols-1 xl:grid-cols-[1.1fr_1fr] gap-5">
        <BalanceCard
          balance={persona.netWorth}
          monthly={persona.monthlyContribution}
        />
        <CardsCarousel persona={persona} />
      </section>

      {/* Quick transfer + Statistics */}
      <section className="grid grid-cols-1 xl:grid-cols-[1.1fr_1fr] gap-5">
        <QuickTransfer />
        <Statistics persona={persona} period={period} setPeriod={setPeriod} />
      </section>

      {/* Transactions + Milestones */}
      <section className="grid grid-cols-1 xl:grid-cols-[1.1fr_1fr] gap-5">
        <Transactions persona={persona} />
        <MilestoneSnapshot persona={persona} />
      </section>
    </div>
  );
}

/* -------------------- Balance card -------------------- */
function BalanceCard({ balance, monthly }: { balance: number; monthly: number }) {
  return (
    <div className="h-card-lavender p-7">
      <div className="text-center">
        <div className="text-sm text-[var(--color-ink-mid)]">Available balance</div>
        <div className="mt-1 text-5xl font-semibold tracking-tight">
          {formatINR(balance, { compact: false }).replace("Rs.", "₹")}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-4 gap-3">
        <ActionButton label="Send" href="/timeline" icon={<ArrowUpRight />} />
        <ActionButton label="Request" href="/instruments" icon={<ArrowDown />} />
        <ActionButton
          label="Split bill"
          href="/tax"
          icon={<NoteIcon />}
        />
        <ActionButton label="Top up" href="/sandbox" icon={<PlusIcon />} />
      </div>

      <div className="mt-5 text-center text-xs text-[var(--color-ink-mid)]">
        {monthly >= 0
          ? `+${formatINR(monthly, { compact: true }).replace("Rs.", "₹")}/mo SIP active`
          : `${formatINR(monthly, { compact: true }).replace("Rs.", "₹")}/mo SWP drawing`}
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

/* -------------------- Cards carousel -------------------- */
function CardsCarousel({ persona }: { persona: ReturnType<typeof useApp>["persona"] }) {
  // Synthesize 3 card tiles from instruments + persona allocation
  const cards = [
    {
      label: "Other",
      amount: persona.netWorth * (persona.allocation.debt / 100),
      last4: "1499",
      exp: "04/28",
      tone: "white" as const,
    },
    {
      label: "Family card",
      amount: persona.netWorth * (persona.allocation.equity / 100),
      last4: "1345",
      exp: "01/28",
      tone: "lavender" as const,
    },
    {
      label: "Other",
      amount: persona.netWorth * (persona.allocation.gold / 100 + persona.allocation.liquid / 100),
      last4: "1872",
      exp: "08/27",
      tone: "white" as const,
    },
  ];

  return (
    <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 snap-x">
      {cards.map((c, i) => (
        <CardTile key={i} {...c} />
      ))}
    </div>
  );
}

function CardTile({
  label,
  amount,
  last4,
  exp,
  tone,
}: {
  label: string;
  amount: number;
  last4: string;
  exp: string;
  tone: "white" | "lavender";
}) {
  const isLavender = tone === "lavender";
  return (
    <div
      className={`shrink-0 snap-start w-[230px] rounded-3xl p-5 flex flex-col justify-between min-h-[180px] ${
        isLavender
          ? "h-card-lavender"
          : "bg-white border border-[var(--color-edge)]"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="text-lg font-bold italic tracking-tight">VISA</div>
        <button className="text-[var(--color-ink-mid)]" aria-label="More">
          <DotsIcon />
        </button>
      </div>
      <div>
        <div className="text-xs text-[var(--color-ink-mid)]">{label}</div>
        <div className="mt-1 text-2xl font-semibold tracking-tight">
          {formatINR(amount, { compact: true }).replace("Rs.", "₹")}
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-[var(--color-ink-mid)]">
        <span>** {last4}</span>
        <span>{exp}</span>
      </div>
    </div>
  );
}

/* -------------------- Quick transfer -------------------- */
function QuickTransfer() {
  const contacts = [
    { name: "Jake", color: "#a8d5ba" },
    { name: "Dilan", color: "#f5c89a" },
    { name: "Anna", color: "#e3b3d4" },
    { name: "Jhali", color: "#a3aef5" },
    { name: "Max", color: "#b8e0d2" },
    { name: "Phill", color: "#c8c8ff" },
  ];

  return (
    <div className="h-panel p-6">
      <div className="text-2xl font-semibold tracking-tight mb-4">Quick transfer</div>
      <div className="rounded-2xl bg-[var(--color-grid)] p-4 flex items-center gap-4 overflow-x-auto">
        <button className="flex flex-col items-center gap-2 shrink-0">
          <span className="h-circle-dark h-12 w-12">
            <PlusIcon />
          </span>
          <span className="text-xs">Add</span>
        </button>
        {contacts.map((c) => (
          <button key={c.name} className="flex flex-col items-center gap-2 shrink-0">
            <span
              className="grid place-items-center h-12 w-12 rounded-full text-sm font-semibold text-white"
              style={{ background: c.color }}
            >
              {c.name.charAt(0)}
            </span>
            <span className="text-xs">{c.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* -------------------- Statistics -------------------- */
function Statistics({
  persona,
  period,
  setPeriod,
}: {
  persona: ReturnType<typeof useApp>["persona"];
  period: "weekly" | "monthly";
  setPeriod: (p: "weekly" | "monthly") => void;
}) {
  // Derive 7 weekday bars from projection volatility
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const seeds = persona.projection.slice(0, 7);
  const max = Math.max(...seeds.map((s) => s.bull));
  const total = seeds.reduce((acc, s) => acc + s.base, 0) / 1000;

  return (
    <div className="h-panel p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="text-2xl font-semibold tracking-tight">Statistics</div>
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
              Weekly
            </button>
            <button
              onClick={() => setPeriod("monthly")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                period === "monthly"
                  ? "bg-[var(--color-pill-dark)] text-white"
                  : "text-[var(--color-ink-mid)]"
              }`}
            >
              Monthly
            </button>
          </div>
          <button className="grid place-items-center h-9 w-9 rounded-full bg-[var(--color-grid)] text-[var(--color-ink)]">
            <CalendarIcon />
          </button>
          <button className="grid place-items-center h-9 w-9 rounded-full bg-[var(--color-pill-dark)] text-white">
            <BarsIcon />
          </button>
        </div>
      </div>

      <div className="mt-5 rounded-2xl bg-[var(--color-grid)] p-5">
        <div className="flex items-center justify-between">
          <button className="grid place-items-center h-8 w-8 rounded-full bg-white text-[var(--color-ink)]">
            <TrendIcon />
          </button>
          <button className="rounded-full bg-white px-3 py-1.5 text-xs font-medium flex items-center gap-1.5">
            Details <ArrowUpRight />
          </button>
        </div>

        <div className="mt-3 text-3xl font-semibold tracking-tight">
          {formatINR(total, { compact: true }).replace("Rs.", "₹")}
          <span className="text-base text-[var(--color-ink-mid)] font-normal">.20</span>
        </div>

        <div className="mt-4 flex items-end justify-between gap-2 h-[140px]">
          {days.map((d, i) => {
            const seed = seeds[i] ?? seeds[seeds.length - 1];
            const baseH = (seed.base / max) * 100;
            const bullH = (seed.bull / max) * 100;
            return (
              <div key={d} className="flex flex-col items-center gap-2 flex-1">
                <div className="flex items-end gap-1 h-[110px] w-full justify-center">
                  <div
                    className="w-3.5 rounded-t-full bg-[var(--color-lavender-deep)]"
                    style={{ height: `${baseH}%` }}
                  />
                  <div
                    className="w-3.5 rounded-t-full bg-[var(--color-pill-dark)]"
                    style={{ height: `${bullH}%` }}
                  />
                </div>
                <span className="text-[11px] text-[var(--color-ink-mid)]">{d}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* -------------------- Transactions -------------------- */
function Transactions({ persona }: { persona: ReturnType<typeof useApp>["persona"] }) {
  const txns = persona.instruments.slice(0, 5).map((inst, i) => ({
    name: inst.name,
    sub: inst.subCategory,
    amount: inst.monthly > 0 ? -inst.monthly : Math.abs(inst.monthly),
    when: ["Today", "Today", "Yesterday", "Yesterday", "2d ago"][i] ?? "earlier",
    time: ["04:31 AM", "08:12 AM", "06:45 PM", "11:02 AM", "—"][i] ?? "—",
    color: ["#ff6b6b", "#34c08a", "#a3aef5", "#f0a93f", "#c8c8ff"][i] ?? "#c8c8ff",
  }));

  return (
    <div className="h-panel p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="text-2xl font-semibold tracking-tight">Transactions</div>
        <Link href="/instruments" className="text-xs text-[var(--color-ink-mid)] hover:text-[var(--color-ink)]">
          View all →
        </Link>
      </div>

      <ul className="flex flex-col gap-3">
        {txns.map((t, i) => (
          <li
            key={i}
            className="flex items-center gap-4 rounded-2xl bg-[var(--color-grid)] px-4 py-3"
          >
            <span
              className="grid place-items-center h-11 w-11 rounded-full text-sm font-semibold text-white shrink-0"
              style={{ background: t.color }}
            >
              {t.name.charAt(0)}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{t.name}</div>
              <div className="text-xs text-[var(--color-ink-mid)]">
                {t.when} · {t.time}
              </div>
            </div>
            <div
              className={`text-sm font-semibold ${
                t.amount < 0 ? "text-[var(--color-ink)]" : "text-[var(--color-mint-dim)]"
              }`}
            >
              {t.amount < 0 ? "-" : "+"}
              {formatINR(Math.abs(t.amount), { compact: false }).replace("Rs.", "₹")}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* -------------------- Milestone snapshot -------------------- */
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
function ArrowUpRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  );
}
function ArrowDown() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14" />
      <path d="m6 13 6 6 6-6" />
    </svg>
  );
}
function NoteIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="4" width="12" height="16" rx="2" />
      <path d="M9 9h6M9 13h6M9 17h4" />
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
      <circle cx="12" cy="6" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="12" cy="18" r="1.6" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
      <rect x="4" y="6" width="16" height="14" rx="2" />
      <path d="M4 10h16M9 4v4M15 4v4" />
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
function TrendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 17 9 11l4 4 8-8" />
      <path d="M14 4h7v7" />
    </svg>
  );
}
