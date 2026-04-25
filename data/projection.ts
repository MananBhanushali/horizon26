import type { Milestone, ProjectionPoint } from "@/lib/types";

// Synthetic month/year projection generator. Deterministic, no engine dependency.
export function buildProjection(opts: {
  startAge: number;
  endAge: number;
  startBalance: number;
  monthlySIP: number;
  baseReturn: number;
  bullDelta?: number;
  bearDelta?: number;
  inflation?: number;
  milestoneDrawdowns?: { age: number; nominal: number; inflation: number }[];
}): ProjectionPoint[] {
  const {
    startAge,
    endAge,
    startBalance,
    monthlySIP,
    baseReturn,
    bullDelta = 2.5,
    bearDelta = 3.0,
    milestoneDrawdowns = [],
  } = opts;
  const months = (endAge - startAge) * 12;
  const drawByMonth = new Map<number, number>();
  for (const m of milestoneDrawdowns) {
    const idx = Math.round((m.age - startAge) * 12);
    const inflated = m.nominal * Math.pow(1 + m.inflation, m.age - startAge);
    drawByMonth.set(idx, (drawByMonth.get(idx) ?? 0) + inflated);
  }

  function simulate(annualReturn: number): { age: number; value: number }[] {
    const r = annualReturn / 100 / 12;
    let bal = startBalance;
    const out: { age: number; value: number }[] = [];
    out.push({ age: startAge, value: bal });
    for (let i = 1; i <= months; i++) {
      bal = bal * (1 + r) + monthlySIP;
      const draw = drawByMonth.get(i);
      if (draw) bal = Math.max(0, bal - draw);
      if (i % 12 === 0) out.push({ age: startAge + i / 12, value: bal });
    }
    return out;
  }

  const base = simulate(baseReturn);
  const bull = simulate(baseReturn + bullDelta);
  const bear = simulate(baseReturn - bearDelta);
  return base.map((p, i) => ({
    age: p.age,
    base: p.value,
    bull: bull[i]?.value ?? p.value,
    bear: bear[i]?.value ?? p.value,
  }));
}

export function deriveMilestoneStatus(milestones: Milestone[], proj: ProjectionPoint[]) {
  return milestones.map((m) => {
    const point = proj.find((p) => Math.abs(p.age - m.age) < 0.6) ?? proj[proj.length - 1];
    const projected = point.base;
    const shortfall = Math.max(0, m.inflatedCost - projected);
    return { ...m, projectedBalance: projected, shortfall };
  });
}
