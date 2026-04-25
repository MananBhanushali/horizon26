// Single source of truth: take a persona's static fixture + the user's entered
// monthly finances and recompute projection / goal funding / aggregate gap so
// every page shows numbers that actually reflect what the user typed.

import { buildProjection } from "@/data/projection";
import type { Milestone, Persona, ProjectionPoint } from "@/lib/types";
import type { UserFinances } from "@/components/providers/AppProvider";

const DEFAULT_INFLATION = 0.055;

export type LiveMilestone = Milestone & {
  projectedBalanceLive: number;
  shortfallLive: number;
  statusLive: "ON_TRACK" | "SHORTFALL" | "SURPLUS";
};

export type LivePlan = {
  projection: ProjectionPoint[];
  milestones: LiveMilestone[];
  finalCorpus: number;
  aggregateShortfall: number;
  onTrackCount: number;
  shortCount: number;
  /** Per-instrument monthly amount, scaled to the user's actual savings. */
  scaledInstruments: { id: string; name: string; category: string; subCategory: string; monthly: number; taxBenefit: string; rationale: string }[];
};

export function deriveLivePlan(persona: Persona, finances: UserFinances, inflation = DEFAULT_INFLATION): LivePlan {
  const monthlySIP = finances.monthlySavings;
  const startAge = persona.age;
  const endAge =
    persona.projection[persona.projection.length - 1]?.age ??
    persona.retirementAge + 5;

  const projection = buildProjection({
    startAge,
    endAge,
    startBalance: persona.netWorth,
    monthlySIP,
    baseReturn: persona.preTaxReturn,
    bullDelta: 2.5,
    bearDelta: 3.0,
    inflation,
    milestoneDrawdowns: persona.milestones.map((m) => ({
      age: m.age,
      nominal: m.nominalCost,
      inflation,
    })),
  });

  const milestones: LiveMilestone[] = persona.milestones.map((m) => {
    const pt =
      projection.find((p) => p.age >= m.age) ??
      projection[projection.length - 1];
    const inflated = m.nominalCost * Math.pow(1 + inflation, m.age - startAge);
    const projected = pt.base;
    const shortfall = Math.max(0, inflated - projected);
    const statusLive: "ON_TRACK" | "SHORTFALL" | "SURPLUS" =
      shortfall > 0
        ? "SHORTFALL"
        : projected > inflated * 1.4
        ? "SURPLUS"
        : "ON_TRACK";
    return {
      ...m,
      inflatedCost: Math.round(inflated),
      projectedBalanceLive: Math.round(projected),
      shortfallLive: Math.round(shortfall),
      statusLive,
    };
  });

  const aggregateShortfall = milestones.reduce(
    (acc, m) => acc + m.shortfallLive,
    0
  );
  const onTrackCount = milestones.filter(
    (m) => m.statusLive === "ON_TRACK" || m.statusLive === "SURPLUS"
  ).length;
  const shortCount = milestones.filter((m) => m.statusLive === "SHORTFALL").length;
  const finalCorpus = projection[projection.length - 1]?.base ?? persona.netWorth;

  // Scale per-instrument monthly so the recommended split adds up to the user's actual savings.
  const baseTotal = persona.instruments.reduce((acc, i) => acc + i.monthly, 0);
  const ratio = baseTotal > 0 ? Math.max(0, monthlySIP) / baseTotal : 0;
  const scaledInstruments = persona.instruments.map((i) => ({
    id: i.id,
    name: i.name,
    category: i.category,
    subCategory: i.subCategory,
    monthly: Math.round(i.monthly * ratio),
    taxBenefit: i.taxBenefit,
    rationale: i.rationale,
  }));

  return {
    projection,
    milestones,
    finalCorpus,
    aggregateShortfall,
    onTrackCount,
    shortCount,
    scaledInstruments,
  };
}
