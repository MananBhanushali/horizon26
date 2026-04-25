"use client";

import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  BedDouble,
  Briefcase,
  Car,
  CheckCircle2,
  Gem,
  GraduationCap,
  Heart,
  HeartPulse,
  House,
  Plane,
  Star,
} from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/ui/Badges";
import { DrawerPanel } from "@/components/ui/DrawerPanel";
import { formatINR } from "@/lib/format";
import { buildProjection } from "@/data/projection";
import type { MilestoneCategory, ProjectionPoint } from "@/lib/types";

type EditableMilestone = {
  id: string;
  name: string;
  category: MilestoneCategory;
  age: number;
  nominalCost: number;
};

const ZOOMS = ["5Y", "10Y", "ALL"] as const;
type Zoom = (typeof ZOOMS)[number];

const CATEGORY_COLOR: Record<MilestoneCategory, string> = {
  education: "#a3aef5",
  home: "#34c08a",
  wedding: "#e3b3d4",
  vehicle: "#f0a93f",
  business: "#6b6bf5",
  retirement: "#7a87df",
  travel: "#a8d5ba",
  healthcare: "#ff6b6b",
  legacy: "#c98919",
  child: "#f5c89a",
};

const CATEGORY_ICON: Record<MilestoneCategory, ReactNode> = {
  education: <GraduationCap className="h-5 w-5" aria-hidden />,
  home: <House className="h-5 w-5" aria-hidden />,
  wedding: <Gem className="h-5 w-5" aria-hidden />,
  vehicle: <Car className="h-5 w-5" aria-hidden />,
  business: <Briefcase className="h-5 w-5" aria-hidden />,
  retirement: <BedDouble className="h-5 w-5" aria-hidden />,
  travel: <Plane className="h-5 w-5" aria-hidden />,
  healthcare: <HeartPulse className="h-5 w-5" aria-hidden />,
  legacy: <Star className="h-5 w-5" aria-hidden />,
  child: <Heart className="h-5 w-5" aria-hidden />,
};

const compact = (n: number) => formatINR(n, { compact: true }).replace("Rs. ", "");

export default function TimelinePage() {
  const { persona, finances, livePlan } = useApp();

  // SWP mode = drawing down (negative monthly savings).
  const isDrawing = finances.monthlySavings < 0;

  const [milestones, setMilestones] = useState<EditableMilestone[]>(() =>
    persona.milestones.map((m) => ({
      id: m.id,
      name: m.name,
      category: m.category,
      age: m.age,
      nominalCost: m.nominalCost,
    }))
  );

  // What-if knobs. monthlySIP defaults to user-entered savings (which itself defaults to persona).
  const [monthlySIP, setMonthlySIP] = useState<number>(finances.monthlySavings);
  const [inflation, setInflation] = useState<number>(5.5);
  const [baseReturn, setBaseReturn] = useState<number>(livePlan.effectiveAnnualReturn);
  const [zoom, setZoom] = useState<Zoom>("ALL");

  const [activeId, setActiveId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Confirmation / result dialogs
  const [confirmDelete, setConfirmDelete] = useState<EditableMilestone | null>(null);
  const [sipResult, setSipResult] = useState<{ id: string; name: string; required: number } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setMilestones(
      persona.milestones.map((m) => ({
        id: m.id,
        name: m.name,
        category: m.category,
        age: m.age,
        nominalCost: m.nominalCost,
      }))
    );
    setMonthlySIP(finances.monthlySavings);
    setBaseReturn(livePlan.effectiveAnnualReturn);
    setActiveId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persona, livePlan.effectiveAnnualReturn]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const startAge = persona.age;
  const endAge = Math.max(persona.retirementAge + 5, ...milestones.map((m) => m.age + 1), 90);

  const projection = useMemo<ProjectionPoint[]>(
    () =>
      buildProjection({
        startAge,
        endAge,
        startBalance: persona.netWorth,
        monthlySIP,
        baseReturn,
        bullDelta: 2.5,
        bearDelta: 3.0,
        inflation: inflation / 100,
        milestoneDrawdowns: milestones.map((m) => ({
          age: m.age,
          nominal: m.nominalCost,
          inflation: inflation / 100,
        })),
      }),
    [startAge, endAge, persona.netWorth, monthlySIP, baseReturn, inflation, milestones]
  );

  // BASELINE projection — the user's saved finances + persona return + persona milestones.
  // Drawn as a faint dashed reference so the live curve visibly diverges when sliders move.
  const baselineProjection = useMemo<ProjectionPoint[]>(
    () =>
      buildProjection({
        startAge,
        endAge,
        startBalance: persona.netWorth,
        monthlySIP: finances.monthlySavings,
        baseReturn: livePlan.effectiveAnnualReturn,
        bullDelta: 2.5,
        bearDelta: 3.0,
        inflation: 0.055,
        milestoneDrawdowns: persona.milestones.map((m) => ({
          age: m.age,
          nominal: m.nominalCost,
          inflation: 0.055,
        })),
      }),
    [startAge, endAge, persona, finances.monthlySavings, livePlan.effectiveAnnualReturn]
  );

  const baselineFinal = baselineProjection[baselineProjection.length - 1]?.base ?? 0;

  const decorated = useMemo(() => {
    return milestones
      .slice()
      .sort((a, b) => a.age - b.age)
      .map((m) => {
        const pt = projection.find((p) => p.age >= m.age) ?? projection[projection.length - 1];
        const inflated = m.nominalCost * Math.pow(1 + inflation / 100, m.age - startAge);
        const projected = pt.base;
        const shortfall = Math.max(0, inflated - projected);
        const status: "ON_TRACK" | "SHORTFALL" | "SURPLUS" =
          shortfall > 0
            ? "SHORTFALL"
            : projected > inflated * 1.4
            ? "SURPLUS"
            : "ON_TRACK";
        return { ...m, inflated, projected, shortfall, status };
      });
  }, [milestones, projection, inflation, startAge]);

  const aggregateShortfall = decorated.reduce((acc, m) => acc + m.shortfall, 0);
  const onTrackCount = decorated.filter(
    (m) => m.status === "ON_TRACK" || m.status === "SURPLUS"
  ).length;
  const shortCount = decorated.filter((m) => m.status === "SHORTFALL").length;
  const finalCorpus = projection[projection.length - 1]?.base ?? 0;
  const avgYearsToGoal =
    decorated.length > 0
      ? decorated.reduce((acc, m) => acc + Math.max(0, m.age - startAge), 0) / decorated.length
      : 0;
  const nextGoalYears =
    decorated.length > 0
      ? Math.max(0, Math.min(...decorated.map((m) => Math.max(0, m.age - startAge))))
      : 0;

  // Find biggest gap for the gap-narrator
  const biggestGap = useMemo(
    () => [...decorated].filter((m) => m.shortfall > 0).sort((a, b) => b.shortfall - a.shortfall)[0] ?? null,
    [decorated]
  );

  // Binary-search SIP for one milestone, with dynamic ceiling
  const findRequiredSIP = (id: string): number => {
    const target = milestones.find((m) => m.id === id);
    if (!target) return 0;
    const inflatedCost = target.nominalCost * Math.pow(1 + inflation / 100, target.age - startAge);
    const monthsToGoal = Math.max(1, (target.age - startAge) * 12);
    // Ceiling: the SIP would have to fund the entire cost from contributions alone (worst case).
    let hi = Math.max(500_000, (inflatedCost * 1.5) / monthsToGoal);
    let lo = Math.min(0, monthlySIP);

    for (let i = 0; i < 32; i++) {
      const mid = (lo + hi) / 2;
      const sim = buildProjection({
        startAge,
        endAge,
        startBalance: persona.netWorth,
        monthlySIP: mid,
        baseReturn,
        bullDelta: 2.5,
        bearDelta: 3.0,
        inflation: inflation / 100,
        milestoneDrawdowns: milestones
          .filter((m) => m.age < target.age)
          .map((m) => ({ age: m.age, nominal: m.nominalCost, inflation: inflation / 100 })),
      });
      const pt = sim.find((p) => p.age >= target.age) ?? sim[sim.length - 1];
      if (pt.base >= inflatedCost) hi = mid;
      else lo = mid;
    }
    return Math.ceil(hi / 100) * 100;
  };

  const active = decorated.find((m) => m.id === activeId) ?? null;

  const updateMilestoneAge = (id: string, age: number) => {
    setMilestones((arr) =>
      arr.map((m) => (m.id === id ? { ...m, age: Math.max(startAge, Math.round(age)) } : m))
    );
  };

  const addMilestone = (data: {
    name: string;
    category: MilestoneCategory;
    age: number;
    nominalCost: number;
  }) => {
    const id = `m-${Date.now()}`;
    setMilestones((arr) => [...arr, { id, ...data }]);
    setShowAddForm(false);
    setToast(`Added "${data.name}". The projection updated.`);
  };

  const removeMilestone = (id: string) => {
    const m = milestones.find((x) => x.id === id);
    setMilestones((arr) => arr.filter((m) => m.id !== id));
    if (activeId === id) setActiveId(null);
    setConfirmDelete(null);
    if (m) setToast(`Removed "${m.name}".`);
  };

  return (
    <>
      <PageHeader
        eyebrow="Timeline"
        title="Will your money meet each goal?"
        subtitle="Drag any goal to change when it happens. Slide the dials on the right to test what-ifs in real time."
        actions={
          <div className="flex items-center gap-2">
            <ZoomToggle zoom={zoom} setZoom={setZoom} />
            <button
              onClick={() => setShowAddForm(true)}
              className="rounded-full bg-[var(--color-pill-dark)] text-white px-4 py-2 text-xs font-medium flex items-center gap-1.5 hover:opacity-90"
            >
              + Add a goal
            </button>
          </div>
        }
      />

      {/* Plain-English insight banner */}
      <InsightBanner
        biggestGap={biggestGap}
        finalCorpus={finalCorpus}
        retirementAge={persona.retirementAge}
        monthly={monthlySIP}
        isDrawing={isDrawing}
        onTrackCount={onTrackCount}
        totalGoals={decorated.length}
        onFix={(id) => setSipResult({
          id,
          name: decorated.find(d => d.id === id)?.name ?? "",
          required: findRequiredSIP(id),
        })}
      />

      {/* KPI strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <KPI
          label="At retirement"
          value={`₹${compact(finalCorpus)}`}
          tone="ok"
          hint={`age ${persona.retirementAge}`}
        />
        <KPI
          label="Funding gap"
          value={aggregateShortfall === 0 ? "₹0" : `−₹${compact(aggregateShortfall)}`}
          tone={aggregateShortfall === 0 ? "ok" : "warn"}
          hint={`${shortCount} goal${shortCount === 1 ? "" : "s"} short`}
        />
        <KPI
          label="Avg years to goals"
          value={`${avgYearsToGoal.toFixed(1)} yr`}
          tone="info"
          hint={`next goal in ${nextGoalYears.toFixed(1)} yr`}
        />
        <KPI
          label={isDrawing ? "Monthly draw" : "Monthly SIP"}
          value={`₹${compact(Math.abs(monthlySIP))}`}
          tone="info"
          hint={`@ ${baseReturn.toFixed(1)}% annual return`}
        />
      </section>

      {/* Chart + sliders */}
      <section className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
        <div className="h-panel p-5">
          <div className="mb-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-dim)]">
              Live projection
            </div>
            <div className="text-[12px] text-[var(--color-ink-dim)]">
              Changes update the curve in real time
            </div>
          </div>
          <InteractiveTimeline
            projection={projection}
            baselineProjection={baselineProjection}
            milestones={decorated}
            startAge={startAge}
            endAge={endAge}
            zoom={zoom}
            onMilestoneDrag={updateMilestoneAge}
            onMilestoneClick={(id) => setActiveId(id)}
          />
          <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-2">
            <GraphMetricTile label="Final corpus" value={`₹${compact(finalCorpus)}`} />
            <GraphMetricTile
              label="Vs base"
              value={`${finalCorpus >= baselineFinal ? "+" : "−"}₹${compact(
                Math.abs(finalCorpus - baselineFinal)
              )}`}
              tone={finalCorpus >= baselineFinal ? "ok" : "warn"}
            />
            <GraphMetricTile
              label={isDrawing ? "Draw" : "SIP"}
              value={`${monthlySIP < 0 ? "−" : ""}₹${compact(Math.abs(monthlySIP))}`}
            />
            <GraphMetricTile label="Return" value={`${baseReturn.toFixed(1)}%`} />
          </div>
        </div>

        <WhatIfPanel
          isDrawing={isDrawing}
          monthlySIP={monthlySIP}
          setMonthlySIP={setMonthlySIP}
          inflation={inflation}
          setInflation={setInflation}
          baseReturn={baseReturn}
          setBaseReturn={setBaseReturn}
          baselineSIP={finances.monthlySavings}
          baselineReturn={livePlan.effectiveAnnualReturn}
          effectiveReturn={livePlan.effectiveAnnualReturn}
          onReset={() => {
            setMonthlySIP(finances.monthlySavings);
            setInflation(5.5);
            setBaseReturn(livePlan.effectiveAnnualReturn);
            setToast("Reset to baseline.");
          }}
        />
      </section>

      {/* Milestone cards */}
      <section className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-3">
        {decorated.map((m) => (
          <div
            key={m.id}
            className="text-left rounded-2xl bg-white border border-[var(--color-edge)] p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-2">
              <button onClick={() => setActiveId(m.id)} className="min-w-0 flex-1 text-left">
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="grid place-items-center h-10 w-10 rounded-full text-white text-base"
                    style={{ background: CATEGORY_COLOR[m.category] }}
                  >
                    {CATEGORY_ICON[m.category]}
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{m.name}</div>
                    <div className="text-[11px] text-[var(--color-ink-dim)]">at age {m.age}</div>
                  </div>
                </div>
              </button>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <StatusBadge status={m.status} size="sm" />
                <button
                  onClick={() => setConfirmDelete(m)}
                  className="text-[11px] text-[var(--color-warn-dim)] hover:underline underline-offset-2"
                >
                  Remove
                </button>
              </div>
            </div>
            <button onClick={() => setActiveId(m.id)} className="mt-3 grid grid-cols-2 gap-2 text-[12px] w-full text-left">
              <Cell label="Cost when due" value={`₹${compact(m.inflated)}`} />
              <Cell label="You'll have" value={`₹${compact(m.projected)}`} />
              <Cell label="Today's cost" value={`₹${compact(m.nominalCost)}`} />
              <Cell
                label={m.shortfall > 0 ? "Short by" : "Surplus"}
                tone={m.shortfall > 0 ? "warn" : "ok"}
                value={
                  m.shortfall > 0
                    ? `₹${compact(m.shortfall)}`
                    : `₹${compact(m.projected - m.inflated)}`
                }
              />
            </button>
          </div>
        ))}
      </section>

      {/* Drawer */}
      <DrawerPanel
        open={!!active}
        onClose={() => setActiveId(null)}
        title={active?.name ?? ""}
        subtitle={
          active
            ? `Goal at age ${active.age} · ${active.category}`
            : undefined
        }
        footer={
          active && (
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => setConfirmDelete(active)}
                className="text-xs text-[var(--color-warn-dim)] hover:underline"
              >
                Remove goal
              </button>
              {active.shortfall > 0 ? (
                <button
                  onClick={() =>
                    setSipResult({
                      id: active.id,
                      name: active.name,
                      required: findRequiredSIP(active.id),
                    })
                  }
                  className="rounded-full bg-[var(--color-pill-dark)] px-4 py-2 text-xs font-medium text-white"
                >
                  How much SIP do I need? →
                </button>
              ) : (
                <span className="text-xs text-[var(--color-mint-dim)] font-medium inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                  Fully funded
                </span>
              )}
            </div>
          )
        }
      >
        {active && (
          <MilestoneEditor
            milestone={active}
            inflation={inflation}
            onChange={(next) =>
              setMilestones((arr) =>
                arr.map((m) => (m.id === next.id ? { ...m, ...next } : m))
              )
            }
          />
        )}
      </DrawerPanel>

      {/* Add dialog */}
      {showAddForm && (
        <AddMilestoneDialog
          startAge={startAge}
          onClose={() => setShowAddForm(false)}
          onAdd={addMilestone}
        />
      )}

      {/* Confirm delete */}
      {confirmDelete && (
        <ConfirmDialog
          title={`Remove "${confirmDelete.name}"?`}
          body="This drops the goal from your timeline. Switching profiles or refreshing will restore the original list."
          confirmLabel="Remove"
          danger
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => removeMilestone(confirmDelete.id)}
        />
      )}

      {/* Find-required-SIP result */}
      {sipResult && (
        <SIPResultDialog
          result={sipResult}
          currentSIP={monthlySIP}
          isDrawing={isDrawing}
          onClose={() => setSipResult(null)}
          onApply={() => {
            setMonthlySIP(sipResult.required);
            setToast(
              `Applied: ₹${compact(sipResult.required)}/month — fully funds "${sipResult.name}".`
            );
            setSipResult(null);
          }}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-full bg-[var(--color-pill-dark)] text-white px-5 py-2.5 text-sm shadow-xl">
          {toast}
        </div>
      )}
    </>
  );
}

/* -------------------- Insight banner -------------------- */
function InsightBanner({
  biggestGap,
  finalCorpus,
  retirementAge,
  monthly,
  isDrawing,
  onTrackCount,
  totalGoals,
  onFix,
}: {
  biggestGap: { id: string; name: string; age: number; shortfall: number } | null;
  finalCorpus: number;
  retirementAge: number;
  monthly: number;
  isDrawing: boolean;
  onTrackCount: number;
  totalGoals: number;
  onFix: (id: string) => void;
}) {
  if (!biggestGap) {
    return (
      <div
        className="rounded-2xl px-5 py-4 mb-4 flex items-center gap-3 flex-wrap"
        style={{
          background: "linear-gradient(135deg, var(--color-mint-soft) 0%, #ffffff 90%)",
        }}
      >
        <div
          className="grid place-items-center h-9 w-9 rounded-xl text-white shrink-0"
          style={{ background: "var(--color-mint-dim)" }}
        >
          <CheckCircle2 className="h-5 w-5" aria-hidden />
        </div>
        <div className="text-sm flex-1 min-w-0">
          <span className="font-semibold">All {totalGoals} goals look fundable.</span>{" "}
          <span className="text-[var(--color-ink-mid)]">
            {isDrawing
              ? `Drawing ₹${compact(Math.abs(monthly))}/month — corpus supports the spend through your projection horizon.`
              : `Keep saving ₹${compact(monthly)}/month and you'll have around ₹${compact(finalCorpus)} at age ${retirementAge}.`}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl px-5 py-4 mb-4 flex items-center gap-3 flex-wrap"
      style={{
        background: "linear-gradient(135deg, var(--color-warn-soft) 0%, #ffffff 90%)",
      }}
    >
      <div
        className="grid place-items-center h-9 w-9 rounded-xl text-white shrink-0"
        style={{ background: "var(--color-warn-dim)" }}
      >
        <AlertCircle className="h-5 w-5" aria-hidden />
      </div>
      <div className="text-sm flex-1 min-w-0">
        <span className="font-semibold">
          {biggestGap.name} at age {biggestGap.age} is short by ₹{compact(biggestGap.shortfall)}.
        </span>{" "}
        <span className="text-[var(--color-ink-mid)]">
          {onTrackCount} of {totalGoals} goals are on track. Try increasing your monthly SIP, or
          push this goal later.
        </span>
      </div>
      <button
        onClick={() => onFix(biggestGap.id)}
        className="rounded-full bg-[var(--color-pill-dark)] text-white px-4 py-2 text-xs font-medium hover:opacity-90 shrink-0"
      >
        Show me the SIP I need
      </button>
    </div>
  );
}

/* -------------------- Zoom toggle -------------------- */
function ZoomToggle({ zoom, setZoom }: { zoom: Zoom; setZoom: (z: Zoom) => void }) {
  const labels: Record<Zoom, string> = { "5Y": "Next 5 yr", "10Y": "Next 10 yr", ALL: "Full life" };
  return (
    <div className="rounded-full bg-white p-1 flex gap-1">
      {ZOOMS.map((z) => (
        <button
          key={z}
          onClick={() => setZoom(z)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            zoom === z
              ? "bg-[var(--color-pill-dark)] text-white"
              : "text-[var(--color-ink-mid)] hover:text-[var(--color-ink)]"
          }`}
        >
          {labels[z]}
        </button>
      ))}
    </div>
  );
}

/* -------------------- Interactive timeline (SVG with drag) -------------------- */

const SVG_W = 800;
const SVG_H = 360;
const PAD = { l: 56, r: 16, t: 18, b: 32 };

function InteractiveTimeline({
  projection,
  baselineProjection,
  milestones,
  startAge,
  endAge,
  zoom,
  onMilestoneDrag,
  onMilestoneClick,
}: {
  projection: ProjectionPoint[];
  baselineProjection: ProjectionPoint[];
  milestones: (EditableMilestone & {
    inflated: number;
    projected: number;
    shortfall: number;
    status: string;
  })[];
  startAge: number;
  endAge: number;
  zoom: Zoom;
  onMilestoneDrag: (id: string, age: number) => void;
  onMilestoneClick: (id: string) => void;
}) {
  const visibleEnd = useMemo(() => {
    if (zoom === "ALL") return endAge;
    return startAge + (zoom === "5Y" ? 5 : 10);
  }, [zoom, startAge, endAge]);

  const filtered = useMemo(
    () => projection.filter((p) => p.age <= visibleEnd),
    [projection, visibleEnd]
  );

  const filteredBaseline = useMemo(
    () => baselineProjection.filter((p) => p.age <= visibleEnd),
    [baselineProjection, visibleEnd]
  );

  const minAge = filtered[0]?.age ?? startAge;
  const maxAge = filtered[filtered.length - 1]?.age ?? visibleEnd;
  // Y-axis anchored to MAX of (live, baseline). When user increases SIP, the live curve
  // grows above the dashed baseline and the user can SEE the change instead of the chart
  // silently auto-rescaling so both look identical.
  const allValues = [
    ...filtered.flatMap((p) => [p.bull, p.base, p.bear]),
    ...filteredBaseline.flatMap((p) => [p.bull, p.base, p.bear]),
  ];
  const maxV = Math.max(...allValues, 1) * 1.05;
  const minV = 0;

  const chartW = SVG_W - PAD.l - PAD.r;
  const chartH = SVG_H - PAD.t - PAD.b;

  const x = (age: number) =>
    PAD.l + ((age - minAge) / (maxAge - minAge || 1)) * chartW;
  const y = (v: number) =>
    PAD.t + chartH - ((v - minV) / (maxV - minV || 1)) * chartH;

  const linePath = (key: "base" | "bull" | "bear", points = filtered) =>
    smoothLinePath(points.map((p) => [x(p.age), y(p[key])] as const));

  const bandPath = () => {
    const top = filtered
      .map((p, i) => `${i === 0 ? "M" : "L"} ${x(p.age).toFixed(1)} ${y(p.bull).toFixed(1)}`)
      .join(" ");
    const bot = filtered
      .slice()
      .reverse()
      .map((p) => `L ${x(p.age).toFixed(1)} ${y(p.bear).toFixed(1)}`)
      .join(" ");
    return `${top} ${bot} Z`;
  };

  const yTicks = useMemo(() => {
    const ticks: number[] = [];
    const step = niceStep(maxV / 4);
    for (let v = 0; v <= maxV; v += step) ticks.push(v);
    return ticks;
  }, [maxV]);

  const xTicks = useMemo(() => {
    const span = maxAge - minAge;
    const step = span > 30 ? 10 : span > 15 ? 5 : span > 6 ? 2 : 1;
    const out: number[] = [];
    for (let a = Math.ceil(minAge); a <= maxAge; a += step) out.push(a);
    return out;
  }, [minAge, maxAge]);

  // Drag state
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [hoverAge, setHoverAge] = useState<number | null>(null);
  const movedRef = useRef(false);
  const downAgeRef = useRef<number | null>(null);

  const ageFromClientX = (clientX: number) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return minAge;
    const px = ((clientX - rect.left) / rect.width) * SVG_W;
    const clamped = Math.max(PAD.l, Math.min(SVG_W - PAD.r, px));
    return minAge + ((clamped - PAD.l) / chartW) * (maxAge - minAge);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const age = ageFromClientX(e.clientX);
    if (dragId) {
      if (downAgeRef.current !== null && Math.abs(age - downAgeRef.current) > 0.4) {
        movedRef.current = true;
      }
      if (movedRef.current) onMilestoneDrag(dragId, age);
      e.preventDefault();
    } else {
      setHoverAge(age);
    }
  };

  const handlePointerUp = () => {
    if (dragId && !movedRef.current) onMilestoneClick(dragId);
    setDragId(null);
    movedRef.current = false;
    downAgeRef.current = null;
  };

  const handlePointerDownMarker = (id: string, age: number) => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragId(id);
    movedRef.current = false;
    downAgeRef.current = age;
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  const visibleMilestones = milestones.filter((m) => m.age >= minAge && m.age <= maxAge);
  const hoverPt =
    hoverAge !== null
      ? filtered.reduce((a, b) =>
          Math.abs(a.age - hoverAge) < Math.abs(b.age - hoverAge) ? a : b
        )
      : null;

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        preserveAspectRatio="none"
        className="w-full select-none h-[260px] sm:h-[320px] lg:h-[360px]"
        style={{ touchAction: "none" }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => {
          setHoverAge(null);
          if (dragId) setDragId(null);
        }}
        role="img"
        aria-label="Life projection timeline. Drag goal markers to reposition."
      >
        <defs>
          <linearGradient id="timelineBandFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-lavender)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--color-lavender)" stopOpacity="0.08" />
          </linearGradient>
        </defs>
        {/* Grid */}
        <g aria-hidden>
          {yTicks.map((t) => (
            <line key={`y${t}`} x1={PAD.l} x2={SVG_W - PAD.r} y1={y(t)} y2={y(t)} stroke="var(--color-edge)" strokeDasharray="2 6" opacity={0.7} />
          ))}
          {xTicks.map((t) => (
            <line key={`x${t}`} x1={x(t)} x2={x(t)} y1={PAD.t} y2={SVG_H - PAD.b} stroke="var(--color-edge)" strokeDasharray="2 6" opacity={0.45} />
          ))}
        </g>

        <path d={bandPath()} fill="url(#timelineBandFill)" />

        {/* BASELINE (dashed reference) — drawn first, behind the live curves */}
        <path
          d={linePath("base", filteredBaseline)}
          fill="none"
          stroke="var(--color-ink-faint)"
          strokeWidth={1.5}
          strokeDasharray="4 5"
          opacity={0.55}
        />

        {/* LIVE projection curves */}
        <path d={linePath("bull")} fill="none" stroke="var(--color-mint-dim)" strokeWidth={1.7} opacity={0.65} />
        <path d={linePath("bear")} fill="none" stroke="var(--color-warn-dim)" strokeWidth={1.5} opacity={0.45} />
        <path d={linePath("base")} fill="none" stroke="var(--color-cyan)" strokeWidth={2.2} />

        {yTicks.map((t) => (
          <text key={`yl${t}`} x={PAD.l - 8} y={y(t) + 3} textAnchor="end" fontSize={10} fill="var(--color-ink-dim)">
            ₹{compact(t)}
          </text>
        ))}
        {xTicks.map((t) => (
          <text key={`xl${t}`} x={x(t)} y={SVG_H - PAD.b + 16} textAnchor="middle" fontSize={10} fill="var(--color-ink-dim)">
            {t}
          </text>
        ))}

        {/* Milestones */}
        {visibleMilestones.map((m) => {
          const cx = x(m.age);
          const closest = filtered.reduce((a, b) =>
            Math.abs(a.age - m.age) < Math.abs(b.age - m.age) ? a : b
          );
          const cy = y(closest.base);
          const color =
            m.status === "ON_TRACK" || m.status === "SURPLUS"
              ? "var(--color-mint-dim)"
              : "var(--color-warn-dim)";
          const isDragging = dragId === m.id;
          return (
            <g
              key={m.id}
              style={{
                transform: `translate(${cx}px, ${cy}px)`,
                transition: isDragging ? "none" : "transform 280ms cubic-bezier(0.4, 0, 0.2, 1)",
                cursor: isDragging ? "grabbing" : "grab",
              }}
              onPointerDown={handlePointerDownMarker(m.id, m.age)}
              role="button"
              aria-label={`${m.name} at age ${m.age}, ${m.status === "SHORTFALL" ? "short" : "on track"}. Drag to change age, click to edit.`}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight") onMilestoneDrag(m.id, m.age + 1);
                else if (e.key === "ArrowLeft") onMilestoneDrag(m.id, m.age - 1);
                else if (e.key === "Enter" || e.key === " ") onMilestoneClick(m.id);
              }}
            >
              <line x1={0} x2={0} y1={PAD.t - cy} y2={SVG_H - PAD.b - cy} stroke={color} strokeWidth={1} opacity={0.4} strokeDasharray="3 3" />
              <circle r={11} fill="white" stroke={color} strokeWidth={2} />
              <circle r={4.25} fill={color} />
              <title>
                {m.name} · age {m.age} · drag to reposition
              </title>
              {isDragging && (
                <text y={-22} textAnchor="middle" fontSize={11} fontWeight={600} fill="var(--color-ink)">
                  age {m.age}
                </text>
              )}
            </g>
          );
        })}

        {hoverPt && !dragId && (
          <g aria-hidden>
            <line x1={x(hoverPt.age)} x2={x(hoverPt.age)} y1={PAD.t} y2={SVG_H - PAD.b} stroke="var(--color-cyan-dim)" strokeWidth={1} opacity={0.4} />
            <circle cx={x(hoverPt.age)} cy={y(hoverPt.base)} r={3.5} fill="var(--color-cyan-dim)" />
          </g>
        )}
      </svg>

      {hoverPt && !dragId && (
        <div
          className="pointer-events-none absolute rounded-2xl bg-white/95 border border-[var(--color-edge)] shadow-lg px-3 py-2 text-[11px] leading-tight"
          style={{ left: `${(x(hoverPt.age) / SVG_W) * 100}%`, top: 6, transform: "translateX(-50%)" }}
        >
          <div className="text-[var(--color-ink-dim)]">
            Age <span className="text-[var(--color-ink)] font-semibold">{hoverPt.age.toFixed(0)}</span>
          </div>
          <div className="text-[var(--color-mint-dim)]">Best ₹{compact(hoverPt.bull)}</div>
          <div className="text-[var(--color-cyan)] font-semibold">Likely ₹{compact(hoverPt.base)}</div>
          <div className="text-[var(--color-warn-dim)]">Worst ₹{compact(hoverPt.bear)}</div>
        </div>
      )}
      <div className="mt-2 flex items-center justify-end text-[11px] text-[var(--color-ink-dim)]">
        <span className="italic flex items-center gap-1">
          <DragIcon /> Drag a marker to change when a goal happens
        </span>
      </div>
    </div>
  );
}

function DragIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12h16" />
      <path d="m8 8-4 4 4 4" />
      <path d="m16 8 4 4-4 4" />
    </svg>
  );
}

/* -------------------- What-if panel -------------------- */
function WhatIfPanel({
  isDrawing,
  monthlySIP,
  setMonthlySIP,
  inflation,
  setInflation,
  baseReturn,
  setBaseReturn,
  baselineSIP,
  baselineReturn,
  effectiveReturn,
  onReset,
}: {
  isDrawing: boolean;
  monthlySIP: number;
  setMonthlySIP: (n: number) => void;
  inflation: number;
  setInflation: (n: number) => void;
  baseReturn: number;
  setBaseReturn: (n: number) => void;
  baselineSIP: number;
  baselineReturn: number;
  effectiveReturn: number;
  onReset: () => void;
}) {
  return (
    <div className="h-panel p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-base font-semibold tracking-tight">What if…</div>
          <div className="text-xs text-[var(--color-ink-dim)] mt-0.5">
            Slide any dial. Numbers update instantly.
          </div>
        </div>
        <button
          onClick={onReset}
          className="text-[11px] text-[var(--color-ink-mid)] hover:text-[var(--color-ink)]"
        >
          Reset
        </button>
      </div>

      <div className="flex flex-col gap-5">
        <Slider
          label={isDrawing ? "Monthly draw / save" : "Monthly SIP"}
          help={
            isDrawing
              ? "Negative = drawing from corpus. Positive = adding savings."
              : "Amount you save into the plan every month."
          }
          value={monthlySIP}
          min={isDrawing ? -200_000 : 0}
          max={500_000}
          step={500}
          format={(v) => (v < 0 ? `−₹${compact(-v)}` : `₹${compact(v)}`)}
          baseline={baselineSIP}
          onChange={setMonthlySIP}
        />
        <Slider
          label="Inflation"
          help="How fast prices rise per year. RBI projects ~4.6% near-term."
          value={inflation}
          min={0}
          max={12}
          step={0.1}
          format={(v) => `${v.toFixed(1)}%`}
          baseline={5.5}
          onChange={setInflation}
        />
        <Slider
          label="Annual return (before tax)"
          help="Average yearly growth your portfolio earns before taxes. Baseline comes from My investments."
          value={baseReturn}
          min={3}
          max={18}
          step={0.1}
          format={(v) => `${v.toFixed(1)}%`}
          baseline={baselineReturn}
          onChange={setBaseReturn}
        />
      </div>

      <div className="mt-5 rounded-2xl bg-[var(--color-grid)] p-3 text-[11px] text-[var(--color-ink-mid)] leading-relaxed">
        <div className="mb-2">
          Investment-tracked baseline return:{" "}
          <strong className="text-[var(--color-ink)]">{effectiveReturn.toFixed(2)}%</strong>
        </div>
        <strong className="text-[var(--color-ink)]">How the math works:</strong> every goal deducts
        its cost (after inflation) from your corpus the moment it hits. The remaining money keeps
        compounding into the next goal — so a big purchase early shrinks everything that comes
        after.
      </div>
    </div>
  );
}

function Slider({
  label,
  help,
  value,
  min,
  max,
  step,
  format,
  baseline,
  onChange,
}: {
  label: string;
  help?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  baseline?: number;
  onChange: (v: number) => void;
}) {
  const changed = baseline !== undefined && Math.abs(value - baseline) > 0.001;
  return (
    <label className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[var(--color-ink-mid)]">{label}</span>
        <span className="text-sm font-semibold tabular-nums">
          {format(value)}
          {changed && (
            <span className="ml-1.5 text-[10px] font-normal text-[var(--color-cyan-dim)]">
              · vs baseline {format(baseline)}
            </span>
          )}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--color-pill-dark)]"
        aria-label={label}
      />
      {help && (
        <span className="text-[10px] text-[var(--color-ink-dim)] leading-relaxed">{help}</span>
      )}
    </label>
  );
}

/* -------------------- Cells / KPI -------------------- */
function Cell({ label, value, tone }: { label: string; value: string; tone?: "ok" | "warn" }) {
  const fg =
    tone === "warn"
      ? "var(--color-warn-dim)"
      : tone === "ok"
      ? "var(--color-mint-dim)"
      : "var(--color-ink)";
  return (
    <div className="rounded-xl bg-[var(--color-grid)] px-3 py-1.5">
      <div className="text-[10px] uppercase tracking-wider text-[var(--color-ink-dim)]">
        {label}
      </div>
      <div className="text-sm font-semibold mt-0.5 tabular-nums" style={{ color: fg }}>
        {value}
      </div>
    </div>
  );
}

function KPI({ label, value, tone, hint }: { label: string; value: string; tone?: "ok" | "warn" | "info"; hint?: string }) {
  const fg =
    tone === "warn"
      ? "var(--color-warn-dim)"
      : tone === "ok"
      ? "var(--color-mint-dim)"
      : tone === "info"
      ? "var(--color-cyan-dim)"
      : "var(--color-ink)";
  return (
    <div className="h-panel px-4 py-3">
      <div className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-ink-dim)]">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold tracking-tight tabular-nums" style={{ color: fg }}>
        {value}
      </div>
      {hint && <div className="text-[11px] text-[var(--color-ink-dim)] mt-0.5">{hint}</div>}
    </div>
  );
}

function GraphMetricTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "ok" | "warn";
}) {
  const fg =
    tone === "warn"
      ? "var(--color-warn-dim)"
      : tone === "ok"
      ? "var(--color-mint-dim)"
      : "var(--color-ink)";

  return (
    <div className="rounded-xl border border-[var(--color-edge)] bg-[var(--color-panel)] px-3 py-2.5">
      <div className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-ink-dim)]">
        {label}
      </div>
      <div className="mt-1 text-xl font-semibold tabular-nums" style={{ color: fg }}>
        {value}
      </div>
    </div>
  );
}

/* -------------------- Editors / dialogs -------------------- */
function MilestoneEditor({
  milestone,
  inflation,
  onChange,
}: {
  milestone: EditableMilestone & {
    inflated: number;
    projected: number;
    shortfall: number;
    status: string;
  };
  inflation: number;
  onChange: (m: Partial<EditableMilestone> & { id: string }) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2 text-[12px]">
        <Cell label="Cost when due" value={`₹${compact(milestone.inflated)}`} />
        <Cell label="You'll have" value={`₹${compact(milestone.projected)}`} />
        <Cell
          label={milestone.shortfall > 0 ? "Short by" : "Surplus"}
          tone={milestone.shortfall > 0 ? "warn" : "ok"}
          value={
            milestone.shortfall > 0
              ? `₹${compact(milestone.shortfall)}`
              : `₹${compact(milestone.projected - milestone.inflated)}`
          }
        />
        <Cell label="Inflation used" value={`${inflation.toFixed(1)}%`} />
      </div>

      <Field label="Goal name">
        <input
          type="text"
          value={milestone.name}
          onChange={(e) => onChange({ id: milestone.id, name: e.target.value })}
          className="w-full rounded-xl border border-[var(--color-edge)] bg-white px-3 py-2 text-sm focus:border-[var(--color-cyan)] focus:outline-none"
        />
      </Field>

      <Field label="When it happens (age)">
        <input
          type="number"
          value={milestone.age}
          min={18}
          max={100}
          onChange={(e) => onChange({ id: milestone.id, age: Number(e.target.value) })}
          className="w-full rounded-xl border border-[var(--color-edge)] bg-white px-3 py-2 text-sm focus:border-[var(--color-cyan)] focus:outline-none"
        />
      </Field>

      <Field label="Cost in today's ₹ (before inflation)">
        <input
          type="number"
          value={milestone.nominalCost}
          min={0}
          step={10000}
          onChange={(e) => onChange({ id: milestone.id, nominalCost: Number(e.target.value) })}
          className="w-full rounded-xl border border-[var(--color-edge)] bg-white px-3 py-2 text-sm focus:border-[var(--color-cyan)] focus:outline-none"
        />
      </Field>
    </div>
  );
}

function AddMilestoneDialog({
  startAge,
  onClose,
  onAdd,
}: {
  startAge: number;
  onClose: () => void;
  onAdd: (data: { name: string; category: MilestoneCategory; age: number; nominalCost: number }) => void;
}) {
  const [name, setName] = useState("");
  const [age, setAge] = useState(startAge + 5);
  const [nominalCost, setNominalCost] = useState(1_000_000);
  const [category, setCategory] = useState<MilestoneCategory>("home");

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
        <div className="text-lg font-semibold tracking-tight">Add a goal</div>
        <div className="text-xs text-[var(--color-ink-dim)] mt-1 leading-relaxed">
          We'll deduct its cost (after inflation) from your corpus at the chosen age and keep
          compounding the rest.
        </div>

        <div className="mt-5 flex flex-col gap-4">
          <Field label="What is it?">
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Apartment down-payment"
              className="w-full rounded-xl border border-[var(--color-edge)] bg-white px-3 py-2 text-sm focus:border-[var(--color-cyan)] focus:outline-none"
            />
          </Field>

          <Field label="Category">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as MilestoneCategory)}
              className="w-full rounded-xl border border-[var(--color-edge)] bg-white px-3 py-2 text-sm focus:border-[var(--color-cyan)] focus:outline-none"
            >
              {(Object.keys(CATEGORY_ICON) as MilestoneCategory[]).map((c) => (
                <option key={c} value={c}>
                  {capitalize(c)}
                </option>
              ))}
            </select>
          </Field>

          <Field label={`When (age ${age})`}>
            <input
              type="range"
              min={startAge}
              max={90}
              step={1}
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="w-full accent-[var(--color-pill-dark)]"
            />
          </Field>

          <Field label="Cost in today's ₹">
            <input
              type="number"
              value={nominalCost}
              step={50000}
              onChange={(e) => setNominalCost(Number(e.target.value))}
              className="w-full rounded-xl border border-[var(--color-edge)] bg-white px-3 py-2 text-sm focus:border-[var(--color-cyan)] focus:outline-none"
            />
            <span className="text-[10px] text-[var(--color-ink-dim)] mt-1">
              Don't include inflation — we'll add that ourselves based on the age you picked.
            </span>
          </Field>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-full bg-[var(--color-grid)] px-4 py-2 text-xs font-medium text-[var(--color-ink-mid)] hover:text-[var(--color-ink)]"
          >
            Cancel
          </button>
          <button
            disabled={!name.trim() || nominalCost <= 0}
            onClick={() => onAdd({ name: name.trim(), category, age, nominalCost })}
            className="rounded-full bg-[var(--color-pill-dark)] px-5 py-2 text-xs font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add to timeline
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmDialog({
  title,
  body,
  confirmLabel = "Confirm",
  danger,
  onCancel,
  onConfirm,
}: {
  title: string;
  body: string;
  confirmLabel?: string;
  danger?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl">
        <div className="text-base font-semibold tracking-tight">{title}</div>
        <div className="text-sm text-[var(--color-ink-mid)] mt-2 leading-relaxed">{body}</div>
        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-full bg-[var(--color-grid)] px-4 py-2 text-xs font-medium text-[var(--color-ink-mid)]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-full px-4 py-2 text-xs font-medium text-white ${
              danger ? "bg-[var(--color-warn-dim)]" : "bg-[var(--color-pill-dark)]"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function SIPResultDialog({
  result,
  currentSIP,
  isDrawing,
  onClose,
  onApply,
}: {
  result: { id: string; name: string; required: number };
  currentSIP: number;
  isDrawing: boolean;
  onClose: () => void;
  onApply: () => void;
}) {
  const delta = result.required - currentSIP;
  const direction = delta > 0 ? "more" : delta < 0 ? "less" : "same";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
        <div className="text-base font-semibold tracking-tight">
          To fully fund "{result.name}"
        </div>
        <div className="text-sm text-[var(--color-ink-mid)] mt-1">
          Here's the minimum monthly SIP that gets the goal to 100% — given your current return,
          inflation, and earlier goal drawdowns.
        </div>

        <div className="mt-5 rounded-2xl bg-[var(--color-grid)] p-5 text-center">
          <div className="text-[11px] uppercase tracking-wider text-[var(--color-ink-dim)]">
            You'd need
          </div>
          <div className="mt-1 text-4xl font-semibold tracking-tight tabular-nums">
            ₹{compact(result.required)}
            <span className="text-base text-[var(--color-ink-mid)] font-normal">/month</span>
          </div>
          {direction === "more" && (
            <div className="mt-2 text-xs text-[var(--color-warn-dim)]">
              ₹{compact(Math.abs(delta))}/month more than your current{" "}
              {isDrawing ? "draw rate" : "SIP"}.
            </div>
          )}
          {direction === "less" && (
            <div className="mt-2 text-xs text-[var(--color-mint-dim)]">
              ₹{compact(Math.abs(delta))}/month less than your current{" "}
              {isDrawing ? "draw rate" : "SIP"}.
            </div>
          )}
          {direction === "same" && (
            <div className="mt-2 text-xs text-[var(--color-ink-dim)]">
              Already at the right level.
            </div>
          )}
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-full bg-[var(--color-grid)] px-4 py-2 text-xs font-medium text-[var(--color-ink-mid)]"
          >
            Not now
          </button>
          <button
            onClick={onApply}
            className="rounded-full bg-[var(--color-pill-dark)] px-5 py-2 text-xs font-medium text-white"
          >
            Apply this SIP
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--color-ink-dim)]">
        {label}
      </span>
      {children}
    </label>
  );
}

/* -------------------- helpers -------------------- */
function niceStep(raw: number): number {
  if (raw <= 0) return 1;
  const exp = Math.floor(Math.log10(raw));
  const base = Math.pow(10, exp);
  const m = raw / base;
  const rounded = m < 1.5 ? 1 : m < 3 ? 2 : m < 7 ? 5 : 10;
  return rounded * base;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function smoothLinePath(points: ReadonlyArray<readonly [number, number]>): string {
  if (points.length === 0) return "";
  if (points.length === 1) {
    const [x0, y0] = points[0];
    return `M ${x0.toFixed(1)} ${y0.toFixed(1)}`;
  }

  const d: string[] = [];
  const [x0, y0] = points[0];
  d.push(`M ${x0.toFixed(1)} ${y0.toFixed(1)}`);
  for (let i = 1; i < points.length; i++) {
    const [xPrev, yPrev] = points[i - 1];
    const [xCurr, yCurr] = points[i];
    const ctrlX = (xPrev + xCurr) / 2;
    d.push(
      `C ${ctrlX.toFixed(1)} ${yPrev.toFixed(1)}, ${ctrlX.toFixed(1)} ${yCurr.toFixed(
        1
      )}, ${xCurr.toFixed(1)} ${yCurr.toFixed(1)}`
    );
  }
  return d.join(" ");
}
