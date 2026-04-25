# Project Horizon (PS-09) - Implementation Plan

> Sibling docs: [PRD](./PRD.md) - [Architecture](./ARCHITECTURE.md)

> **v1 scope: frontend-only modular investment intelligence platform.** Six personas ship as TypeScript modules carrying fully pre-baked data: Black-Litterman optimized allocations, macro context, tax-adjusted returns, reasoning traces, and confidence levels. The runtime job is rendering and switching - all complex computation runs **offline at fixture-authoring time**.

## 1. Phased Roadmap

```text
Phase 0 (~2 h)   Foundation              - types, design tokens, layout shell
Phase 1 (~4 h)   Persona Fixtures        - author 6 personas with full intelligence data
Phase 2 (~2 h)   Persona Switcher        - top-bar pills + state + transitions
Phase 3 (~4 h)   Timeline + Milestones   - SVG curve, markers, zoom
Phase 4 (~3 h)   Allocation + BL         - donut, glide path, efficient frontier, BL views
Phase 5 (~3 h)   Macro + Tax Panels      - macro dashboard, tax breakdown, 80C meter
Phase 6 (~3 h)   Reasoning + Confidence  - reasoning trace, confidence badge, sensitivity
Phase 7 (~3 h)   Polish + Demo           - narration, a11y, responsive, demo script
```

Total: ~24 h for P0 (fits a one-day intense hackathon or two normal days).

## 2. Detailed Task Breakdown

### Phase 0 - Foundation (~2 h)

- [ ] Create `horizon26/lib/types.ts` with the expanded type model (see [ARCHITECTURE.md](./ARCHITECTURE.md) section 3):
  - `Persona`, `PersonaVariant`, `Milestone`, `Allocation`, `GlidePathPoint`
  - `MacroSnapshot`, `MacroImpact`, `RebalanceTrigger`
  - `TaxBreakdown`, `TaxRules`
  - `BLOptimization`, `InvestorView`, `EfficientFrontierPoint`
  - `ReasoningTrace`, `SensitivityAnalysis`
- [ ] Define `lib/constants/`:
  - `categories.ts` - milestone categories
  - `colors.ts` - status colors (on-track, shortfall, surplus)
  - `taxRules.ts` - Indian tax rules (LTCG, STCG, 80C, 80CCD)
  - `macroSnapshot.ts` - Apr 2026 hardcoded macro data
- [ ] Set up Tailwind v4 design tokens in `app/globals.css` (`@theme` block):
  - `--color-on-track`, `--color-shortfall`, `--color-surplus`
  - `--color-equity`, `--color-debt`, `--color-gold`, `--color-liquid`
  - `--color-confidence-high`, `--color-confidence-med`, `--color-confidence-low`
- [ ] Build the page shell in `app/page.tsx`:
  - Header: logo + persona pills + logout (P1)
  - Main: 3-column grid (timeline | allocation + BL | macro + tax)
  - Footer: disclaimer + confidence legend
- [ ] Wire up zustand store `store/usePlanStore.ts`:
  - `selectedPersonaId`, `selectedVariantId`, `zoom`
  - `showMacroPanel`, `showTaxPanel` toggles

### Phase 1 - Persona Fixtures (~4 h)

Author each persona as a fully self-contained module under `data/personas/`. Each file exports a `Persona` object with the **expanded** shape including BL optimization, macro impact, tax, reasoning, and confidence.

**Offline fixture-authoring workflow:**

1. Run Black-Litterman optimization in a Python notebook (see `scripts/bl_optimizer.py` - NOT shipped).
2. Run forward projection simulation (see `scripts/buildProjections.ts`).
3. Compute tax-adjusted returns using the tax rules module.
4. Author reasoning trace and sensitivity analysis.
5. Paste all outputs into the TypeScript fixture.

**Persona files:**

- [ ] `data/personas/riya.ts` - College Student (20), Very Aggressive
- [ ] `data/personas/aditya.ts` - Aspirer (28), Aggressive
- [ ] `data/personas/priya.ts` - Provider (38), Moderate-Aggressive
- [ ] `data/personas/vikram.ts` - Late Starter (42), Moderate
- [ ] `data/personas/raj.ts` - Pre-retiree (55), Moderate-Conservative
- [ ] `data/personas/sharma.ts` - Senior (65), Conservative
- [ ] `data/personas/index.ts` - barrel export + ordered list

**Expanded persona module shape:**

```ts
export const aditya: Persona = {
  id: 'aditya',
  label: 'Aditya the Aspirer',
  emoji: '🎯',
  ageRange: '25-32',
  riskProfile: 'AGGRESSIVE',
  headline: 'Sequential drawdown - house hurts business',
  
  // Core snapshot
  snapshot: {
    currentAge: 28,
    monthlyContribution: 32000,
    currentNetWorth: 800000,
    inflationAssumption: 0.055,
  },
  
  // BL-optimized allocation
  allocation: { equity: 0.80, debt: 0.10, gold: 0.05, liquid: 0.05 },
  
  // Black-Litterman details
  blOptimization: {
    equilibriumWeights: { equity: 0.60, debt: 0.25, gold: 0.10, liquid: 0.05 },
    views: [
      { asset: 'equity', viewReturn: 0.14, equilibriumReturn: 0.11, confidence: 0.7, rationale: 'Bullish on domestic mid-caps due to manufacturing tailwinds' },
    ],
    posteriorReturns: { equity: 0.128, debt: 0.072, gold: 0.085, liquid: 0.055 },
    efficientFrontier: [/* { risk, return } points for SVG path */],
    selectedPoint: { risk: 0.16, return: 0.118 },
  },
  
  // Glide path
  glidePath: [/* { age, allocation } per year from 28 to 60 */],
  
  // Projection variants
  variants: [
    {
      id: 'baseline',
      label: '32 K SIP',
      projection: [/* { age, balance } yearly samples */],
      milestones: [
        { id: 'apt', label: 'Apartment', age: 32, category: 'home', nominalCost: 8000000, inflatedCost: 9780000, projectedBalance: 3540000, status: 'SHORTFALL', gap: 6240000 },
        { id: 'studio', label: 'Studio', age: 35, category: 'business', nominalCost: 1500000, inflatedCost: 1940000, projectedBalance: 2200000, status: 'ON_TRACK', gap: -260000 },
      ],
    },
    {
      id: 'pushed',
      label: '48 K SIP',
      projection: [/* ... */],
      milestones: [/* status flips to ON_TRACK */],
    },
  ],
  
  // Per-goal bucket allocations
  bucketAllocations: {
    'apt': { equity: 0.50, debt: 0.40, gold: 0.07, liquid: 0.03 },  // 4 yrs out
    'studio': { equity: 0.65, debt: 0.25, gold: 0.07, liquid: 0.03 },  // 7 yrs out
  },
  
  // Instruments
  instruments: [
    { name: 'Nifty 50 Index Fund', category: 'equity', monthly: 8000, rationale: 'Low-cost large-cap core' },
    { name: 'Flexi-cap Fund', category: 'equity', monthly: 10000, rationale: 'Active mid-cap tilt per BL view' },
    { name: 'ELSS (tax saver)', category: 'equity', monthly: 8000, rationale: 'Maxes 80C, equity exposure' },
    { name: 'Dynamic Bond Fund', category: 'debt', monthly: 3200, rationale: 'Duration flexibility' },
    { name: 'Sovereign Gold Bond', category: 'gold', monthly: 1600, rationale: '2.5% interest + gold upside' },
    { name: 'Liquid Fund', category: 'liquid', monthly: 1200, rationale: 'Emergency buffer' },
  ],
  
  // Macro impact
  macroImpact: 'Elevated inflation (4.6%) increases apartment cost by Rs. 18L over 4 years. Stable repo (5.25%) supports debt allocation.',
  rebalanceTriggers: [
    { trigger: 'Inflation > 5.5%', action: 'Shift 5% from debt to gold', rationale: 'Gold hedges inflation' },
    { trigger: 'Repo cut > 50 bps', action: 'Shift 5% to long-duration debt', rationale: 'Capture rate rally' },
  ],
  
  // Tax
  taxBreakdown: {
    preTaxReturn: 0.128,
    postTaxReturn: 0.114,
    taxDrag: 0.014,
    ltcgAmount: 45000,
    stcgAmount: 0,
    debtTaxAmount: 12000,
    section80CUsed: 150000,
    section80CLimit: 150000,
    section80CCDUsed: 50000,
  },
  
  // Reasoning and confidence
  reasoningTrace: `You're 28 with high risk capacity (score: 82) and aggressive appetite (stated: 8/10). Effective risk = min(82, 80) = 80 → Aggressive band.

Black-Litterman tilts your allocation toward mid-cap equity (+3% vs equilibrium) because your view is bullish on domestic manufacturing. This increases expected return from 11.5% to 12.8% with slightly higher volatility.

Your apartment goal at 32 is only 4 years out, so its bucket runs balanced (50/40/7/3) rather than aggressive. The studio bucket at 7 years runs moderate (65/25/7/3).

Tax efficiency: ELSS maxes your 80C (Rs. 1.5L), reducing tax drag. Post-tax return: 11.4%.`,
  
  confidenceLevel: 0.85,
  confidenceExplanation: '85% confidence based on: BL model fit (good), macro stability (moderate), 4-7 year horizon (favorable).',
  
  sensitivityAnalysis: [
    { factor: 'Inflation +1%', impact: 'Real return drops from 6.9% to 5.8%' },
    { factor: 'Equity return -3%', impact: 'Apartment shortfall increases by Rs. 8L' },
    { factor: 'Repo rate +50 bps', impact: 'Debt allocation underperforms by 0.3%' },
  ],
  
  // Narration per milestone
  narration: {
    'apt': 'Rs. 62.4 L short. Increase SIP to Rs. 48 K, delay to age 34, or take Rs. 50 L home loan (EMI Rs. 42 K @ 8.5%).',
    'studio': 'On track with Rs. 2.6 L surplus. Consider adding a contingency buffer.',
  },
};
```

**Offline helper scripts (NOT shipped):**

- [ ] `scripts/bl_optimizer.py` - Python script that runs Black-Litterman given equilibrium weights, views, and tau. Outputs posterior returns + efficient frontier.
- [ ] `scripts/buildProjections.ts` - Node script that runs forward sim, computes milestones, outputs fixture-ready arrays.
- [ ] `scripts/taxCalculator.ts` - Computes tax breakdown given allocation and returns.

### Phase 2 - Persona Switcher (~2 h)

- [ ] `components/PersonaPills/PersonaPill.tsx` - rounded pill with emoji, label, ageRange.
- [ ] `components/PersonaPills/PersonaPillRow.tsx` - horizontally scrollable, keyboard-navigable.
- [ ] `components/PersonaPills/PersonaSnapshotCard.tsx` - KPI tiles: age, SIP, net worth, confidence badge, headline status.
- [ ] `components/PersonaPills/VariantPills.tsx` - what-if variant switcher.
- [ ] Cross-fade transition on persona change (CSS opacity + `@starting-style`).

### Phase 3 - Timeline + Milestones (~4 h)

- [ ] `lib/viz/scales.ts` - `ageToX`, `balanceToY` linear scales.
- [ ] `lib/viz/path.ts` - monotone-cubic interpolation for smooth curves.
- [ ] `components/Timeline/TimelineCanvas.tsx` - root SVG with grid.
- [ ] `components/Timeline/AxisX.tsx`, `AxisY.tsx` - age labels, lakhs/crores labels.
- [ ] `components/Timeline/ProjectionCurve.tsx` - smooth `<path>` from `variant.projection[]`.
- [ ] `components/Timeline/MilestoneMarker.tsx` - circle + label + status badge (ON_TRACK/SHORTFALL).
- [ ] `components/Timeline/ZoomController.tsx` - 5 yr / 10 yr / Full buttons, RAF-driven transform.
- [ ] `components/Timeline/MilestoneDetailPanel.tsx` - slide-in panel with bucket allocation + narration.

### Phase 4 - Allocation + BL Visualizations (~3 h)

- [ ] `components/Allocation/DonutChart.tsx` - SVG donut for `persona.allocation` with center label.
- [ ] `components/Allocation/GlidePathChart.tsx` - stacked area chart over `persona.glidePath[]`.
- [ ] `components/Allocation/EfficientFrontierChart.tsx` - scatter + line showing frontier with selected point marked.
- [ ] `components/Allocation/BLViewsPanel.tsx` - list of investor views with confidence bars.
- [ ] `components/Allocation/InstrumentList.tsx` - table with name, category, monthly Rs., rationale tooltip.

### Phase 5 - Macro + Tax Panels (~3 h)

- [ ] `components/Macro/MacroDashboard.tsx` - panel showing repo rate, inflation, GDP, crude, outlook.
- [ ] `components/Macro/MacroSparklines.tsx` - 12-month sparklines for inflation and repo (hardcoded data).
- [ ] `components/Macro/MacroImpactCard.tsx` - one-liner macro impact per persona.
- [ ] `components/Macro/RebalanceTriggersCard.tsx` - list of triggers with actions.
- [ ] `components/Tax/TaxBreakdownPanel.tsx` - pre-tax vs post-tax, LTCG, STCG, debt tax, tax drag.
- [ ] `components/Tax/Section80CMeter.tsx` - progress bar showing 80C utilization vs Rs. 1.5 L limit.
- [ ] `components/Tax/TaxEfficientCallout.tsx` - highlight which instruments are tax-efficient.
- [ ] `lib/tax/indianTax.ts` - tax rules module (for P1 live recompute; P0 uses pre-computed values).

### Phase 6 - Reasoning + Confidence (~3 h)

- [ ] `components/Reasoning/ReasoningTraceCard.tsx` - expandable card showing `persona.reasoningTrace`.
- [ ] `components/Reasoning/ConfidenceBadge.tsx` - "85% confidence" badge with tooltip explanation.
- [ ] `components/Reasoning/SensitivityTable.tsx` - table showing factor → impact.
- [ ] `components/Reasoning/WhyThisAllocationTooltip.tsx` - tooltip on donut slices linking to reasoning.
- [ ] Integrate reasoning into allocation panel header.

### Phase 7 - Polish + Demo (~3 h)

- [ ] `components/Narration/GapNarrator.tsx` - renders milestone-specific one-liner.
- [ ] `lib/persistence/storage.ts` - persist `{selectedPersonaId, selectedVariantId, zoom}` to `localStorage`.
- [ ] Footer disclaimer: "All numbers are illustrative. Not financial advice. Macro data as of Apr 2026."
- [ ] Light / dark mode via Tailwind v4 `prefers-color-scheme`.
- [ ] a11y pass: roving tabindex on pills, ARIA on markers, focus visible.
- [ ] Lighthouse pass: aim for >= 90 perf, >= 95 a11y.
- [ ] Demo script: walk all 19 P0 must-have stories in <= 7 min.
- [ ] Default to Aditya on first load; show "demo accounts" panel if auth is enabled.

## 3. Dependencies

Lean stack - no ML runtime, no backend.

```bash
npm i clsx zustand
```

- **`zustand`** - global UI state.
- **`clsx`** - conditional class merging.

**Not included:**

- ~~Python / NumPy / SciPy~~ - BL optimization runs offline, not shipped.
- ~~D3 / Recharts~~ - hand-rolled SVG for control.
- ~~Framer Motion~~ - CSS transitions + RAF are enough.
- ~~Vitest~~ - no live engine to unit-test in P0.

## 4. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| BL optimization inconsistency | Med | High | Use a single Python notebook for all personas; version-control the notebook; cross-check with online BL calculator |
| Hardcoded macro data feels stale | Med | Med | Show "as of Apr 2026" timestamp prominently; triggers explain what *would* happen |
| Reasoning traces feel generic | Med | Med | Author persona-specific traces referencing their unique views and goals |
| Confidence levels feel arbitrary | Med | Med | Provide tooltip explaining the three factors (model fit, macro, horizon) |
| Tax rules change | Low | Med | Centralize rules in `lib/tax/indianTax.ts`; add FY label |
| One-day timebox too tight | High | High | Ruthlessly cut: skip efficient frontier chart, skip sparklines, simplify tax panel to one number |
| Tailwind v4 / Next 16 quirks | Med | Med | Heed `AGENTS.md`; stick to client components |

## 5. Definition of Done (per feature)

1. Fixture data type-checks against `Persona` interface.
2. All six personas selectable and render without missing-data warnings.
3. Reasoning trace, confidence, and sensitivity render for each persona.
4. Macro dashboard shows Apr 2026 snapshot with timestamp.
5. Tax breakdown shows pre-tax vs post-tax and 80C utilization.
6. Component is keyboard-navigable.
7. No console warnings, no `any` types, ESLint clean.
8. Works in Chrome / Safari / Firefox latest.
9. Lighthouse on `/` >= 90 perf, >= 95 a11y.

## 6. v2 Backlog (deferred)

The following become straightforward additions because fixtures and engine output share the same shape.

- Live `forwardSim` engine with debounced recompute.
- Live Black-Litterman optimizer (WASM or in-browser TS).
- Drag-to-reposition milestone markers.
- User-editable investor views that re-run BL.
- Live macro data from RBI / NSE APIs.
- Hardcoded auth (login screen, route guard).
- PDF export, persona comparison, Monte Carlo visualization.

---

Next: see [ARCHITECTURE.md](./ARCHITECTURE.md) for the system design that this plan delivers.
