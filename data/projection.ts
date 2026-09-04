import type { Milestone, ProjectionPoint } from "@/lib/types";

// Realistic month-by-month projection generator.
//
// Mathematical basis:
//   Core accumulation: B(t+1) = B(t) × (1 + r/12) + SIP   (monthly compound interest with periodic deposits)
//   Closed-form equivalent: FV = PV(1+r)^n + PMT × ((1+r)^n − 1) / r
//   Volatility cone: bull/bear = base ± σ × √(years) × corpus   (scales with √time, giving the classic funnel shape)
//   Real return (Fisher equation): (1 + nominal) / (1 + inflation) − 1
//   Milestone inflation: cost_real = nominal × (1 + π)^years
//
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
    inflation = 0.055,
    milestoneDrawdowns = [],
  } = opts;
  const months = (endAge - startAge) * 12;

  // Pre-compute milestone drawdown amounts by month index, inflation-adjusted.
  // Formula: inflatedCost = nominalCost × (1 + π)^yearsFromNow
  const drawByMonth = new Map<number, number>();
  for (const m of milestoneDrawdowns) {
    const idx = Math.round((m.age - startAge) * 12);
    const yearsFromNow = m.age - startAge;
    const inflated = m.nominal * Math.pow(1 + m.inflation, yearsFromNow);
    drawByMonth.set(idx, (drawByMonth.get(idx) ?? 0) + inflated);
  }

  // Monthly compounding simulation:
  //   B(t+1) = B(t) × (1 + annualReturn/12) + monthlySIP
  //   At milestone months, subtract the inflation-adjusted drawdown.
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

  // Volatility-cone approach for bull/bear bands:
  // Instead of flat return deltas (which compress early years and exaggerate later years),
  // we simulate at base ± delta but also apply a √t scaling factor to blend
  // from narrow (near-term, more predictable) to wide (long-term, less certain).
  //
  // bullValue(t) = baseSim(baseReturn + bullDelta) × blendFactor(t) + base(t) × (1 - blendFactor(t))
  // where blendFactor(t) = min(1, √(yearsElapsed / totalYears))
  //
  // This produces the classic "expanding fan" shape seen in professional financial projections.
  const bullSim = simulate(baseReturn + bullDelta);
  const bearSim = simulate(baseReturn - bearDelta);
  const totalYears = endAge - startAge;

  // Real return line: deflate base values to today's purchasing power using Fisher equation.
  // realReturn = (1 + nominal) / (1 + inflation) - 1
  // Deflation factor at year t: 1 / (1 + inflation)^t
  const effectiveInflation = typeof inflation === "number" ? inflation : 0.055;

  return base.map((p, i) => {
    const yearsElapsed = p.age - startAge;
    // √t blend: 0 at start → 1 at end, giving the classic cone shape
    const blend = totalYears > 0 ? Math.min(1, Math.sqrt(yearsElapsed / totalYears)) : 0;

    const bullRaw = bullSim[i]?.value ?? p.value;
    const bearRaw = bearSim[i]?.value ?? p.value;

    // Blend between base and full-delta scenarios using √t factor
    const bull = p.value + (bullRaw - p.value) * blend;
    const bear = p.value - (p.value - bearRaw) * blend;

    // Deflate to today's rupees: realValue = nominalValue / (1 + π)^t
    const deflator = Math.pow(1 + effectiveInflation, yearsElapsed);
    const real = p.value / deflator;

    return {
      age: p.age,
      base: p.value,
      bull,
      bear: Math.max(0, bear),
      real,
    };
  });
}

export function deriveMilestoneStatus(milestones: Milestone[], proj: ProjectionPoint[]) {
  return milestones.map((m) => {
    const point = proj.find((p) => Math.abs(p.age - m.age) < 0.6) ?? proj[proj.length - 1];
    const projected = point.base;
    const shortfall = Math.max(0, m.inflatedCost - projected);
    return { ...m, projectedBalance: projected, shortfall };
  });
}
