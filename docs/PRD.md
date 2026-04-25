# Project Horizon (PS-09) - Product Requirements Document

> Sibling docs: [Implementation Plan](./PLAN.md) - [Architecture](./ARCHITECTURE.md)

## 1. Document Control

| Field | Value |
|---|---|
| Project Code | PS-09 |
| Project Name | Project Horizon |
| Version | 1.0 (Draft) |
| Owner | Hack Tuah team |
| Target Stack | Next.js 16 (App Router) + React 19 + Tailwind v4 + TypeScript |
| Repo path | `horizon26/` |

## 2. Vision

> An interactive financial-planning tool where users drop life milestones onto a timeline (apartment, wedding, business, retirement) and see - in real time - whether their savings can hit them. The engine combines **event-driven compound interest** with **age-based risk profiling** so the recommendations adapt to *who* the user is, not just *what* they want.

### 2.1 Core Insight

Standard SIP calculators assume uninterrupted compounding. Real life has **drawdowns** - you buy a house at 32, your corpus resets, then it has to compound again toward the next goal. Project Horizon simulates this month-by-month, with each milestone cascading into the next.

### 2.2 The Two Halves

**Half 1 - Milestone Engine (the math)**

- Sequential monthly simulator: contribute -> compound -> drawdown when a milestone hits.
- Inflation-adjusts every milestone cost (RBI 4.6 % near-term, user-set long-term).
- Runs **Bull / Base / Bear** scenarios so users see a range, not a false-precision single number.
- Binary-searches the SIP needed to fully fund any goal - instant "you'd need Rs. X / month" answers.

**Half 2 - Risk Profiler (the judgment)**

- Age bands set the default mix (20s: 80 / 10 / 5 / 5 -> 60s: 30 / 60 / 7 / 3).
- Risk score = `capacity AND appetite` - you can't take more risk than you can afford, even if you want to. Capacity factors: age, years to retirement, cushion ratio, dependents, job stability.
- Glide path: as a goal gets closer, its allocation auto-shifts toward debt (<= 2 yr: 20 / 70, <= 5 yr: 45 / 45, <= 10 yr: 65 / 25, beyond: age-band default).

### 2.3 The Merge - Goal-Based Bucketing

This is the piece that makes both halves work together. Instead of one portfolio, the user's monthly SIP is split into **buckets** - one per milestone, plus emergency and retirement. Each bucket runs its own allocation based on its own time-to-goal. So at age 28, the apartment bucket (4 yrs out) runs balanced, the studio bucket (7 yrs out) runs moderate, and retirement (32 yrs out) runs aggressive - all simultaneously, all in one simulation. SIP is weighted across buckets by `cost / years_to_goal` (urgent expensive goals pull more contribution).

If a milestone bucket falls short, the engine **auto-pulls from retirement** and flags the event so the user sees the trade-off explicitly.

### 2.4 The Five Intelligence Layers

Project Horizon is a **modular investment intelligence platform** that converts complex data into actionable allocation decisions with reasoning and confidence levels. It's **decision-driven**, not just data-driven.

```text
+------------------+     +----------------------+     +------------------+
|  User Profiler   | --> | Portfolio Optimizer  | --> |   Tax Engine     |
|  (risk scoring)  |     | (Black-Litterman)    |     | (LTCG/STCG/80C)  |
+------------------+     +----------------------+     +------------------+
         |                         |                          |
         v                         v                          v
+------------------+     +----------------------+     +------------------+
| Macro Forecaster | --> | Dynamic Adjustment   | --> |    Dashboard     |
| (inflation/repo) |     | (rebalance triggers) |     | (reasoning + CI) |
+------------------+     +----------------------+     +------------------+
```

**Layer 1 - User Profiler**

Classifies users based on age, income, goals, and risk tolerance to generate a **risk score**. This feeds into portfolio construction.

- Input: persona snapshot (age, income, dependents, job stability, stated risk appetite)
- Output: risk score 1-100, risk capacity score, effective risk = `min(capacity, appetite)`

**Layer 2 - Portfolio Optimizer (Black-Litterman MPT)**

Uses **Modern Portfolio Theory** with **Black-Litterman enhancement** to allocate assets across equity, debt, gold, and alternatives.

- Market equilibrium weights (CAPM baseline)
- Investor views overlaid (e.g., "I believe Nifty will return 14 % vs equilibrium 11 %")
- Posterior expected returns blended from views + equilibrium
- Mean-variance optimization on posterior to produce **efficient frontier**
- Final allocation picked at the persona's risk-score-appropriate point on the frontier

For v1, BL optimization runs **offline at fixture-authoring time**. Each persona ships with a pre-optimized allocation + the reasoning trace that explains *why* this mix.

**Layer 3 - Macro Forecaster**

Predicts inflation, repo rates, and market conditions using statistical models, policy rules (Taylor rule), and geopolitical sentiment.

- Apr 2026 snapshot (hardcoded fixtures):
  - RBI repo rate: 5.25 %
  - CPI inflation: 4.6 % (RBI FY27 projection)
  - GDP growth: 6.9 %
  - Crude oil: > $100/bbl (geopolitical risk elevated)
  - Market outlook: range-bound H1, potential rally H2

For v1, macro forecasts are **pre-computed and shipped as fixtures**. Each persona's projection incorporates this macro context, and the dashboard explains how macro affects allocation.

**Layer 4 - Tax Engine**

Adjusts returns based on Indian taxation rules. Runs **client-side** (simple rules, no server).

- LTCG on equity: 12.5 % above Rs. 1.25 L exemption (holding > 1 yr)
- STCG on equity: 20 % (holding <= 1 yr)
- Debt fund taxation: slab rate (post-2023 rules, no indexation)
- Gold / SGB: LTCG 20 % with indexation (> 3 yr) or slab rate
- 80C deductions: ELSS, PPF, NPS (up to Rs. 1.5 L)
- 80CCD(1B): additional Rs. 50 K for NPS

Each persona's projection shows **pre-tax vs post-tax returns** with a one-line tax impact summary.

**Layer 5 - Dynamic Adjustment Layer**

Continuously rebalances portfolios in response to changing macro signals.

- Trigger: inflation spike > 1 % above forecast -> shift 5 % from debt to gold
- Trigger: repo rate cut > 50 bps -> shift 5 % from short-duration to long-duration debt
- Trigger: equity drawdown > 15 % -> opportunistic rebalancing into equity from cash

For v1, these are **pre-computed scenarios** shipped as what-if variants. The UI explains what trigger would cause what rebalance.

### 2.5 Decision-Driven Output

Every allocation comes with:

1. **Reasoning trace** - plain-English explanation of *why* this mix (e.g., "You're 28 with high risk capacity and aggressive appetite. BL model tilts toward mid-cap equity because your view is bullish on domestic growth. Tax-efficient via ELSS.")
2. **Confidence level** - 70 % / 85 % / 95 % confidence band based on macro uncertainty and model fit
3. **Sensitivity analysis** - "If inflation rises 1 %, your real return drops from 9 % to 7.8 %"

This is the key differentiation: most tools show *what* to invest. We show *what*, *why*, and *how confident* we are.

## 3. Problem Statement

Existing SIP / retirement calculators in India:

- Treat goals as **independent silos** (one calculator per goal) - they ignore that buying a house at 32 *drains* the corpus that was supposed to fund a business at 35.
- Use a **flat equity / debt ratio** regardless of age or proximity to goal.
- Surface **shortfalls visually** on a timeline.
- Allow **continuous what-if** manipulation (drag to reposition a goal, slide savings rate, see impact).
- Risk profiling is dynamic, not a one-time questionnaire — it adjusts every time the user changes age, milestones, or income.


Project Horizon answers a different question. Most calculators answer *"Can I afford X?"* Ours answers *"Given everything I want, what's the realistic plan?"* - including which goals need a loan, which need delay, and how risk should shift as life progresses.

### 3.2 Key Differentiation

| Traditional Tools | Project Horizon |
|---|---|
| Data-driven: show numbers | **Decision-driven**: show allocation + reasoning + confidence |
| Single-goal calculators | **Multi-goal bucketing** with cascade effects |
| Flat risk questionnaire | **Dynamic risk score** = capacity AND appetite, recomputed on every change |
| Ignore macro context | **Macro-aware**: inflation, repo rate, market outlook affect allocation |
| Pre-tax returns only | **Tax-adjusted returns** with LTCG/STCG/80C impact visible |
| Mean-variance optimization | **Black-Litterman MPT** with investor views overlaid on equilibrium |
| "Your portfolio is X" | "Your portfolio is X **because** Y, with **Z % confidence**" |

### 3.1 Build Strategy (v1 vs. stretch)

To make this shippable in a hackathon timebox, v1 layers in two stages:

1. **Must-have baseline (P0)** - six built-in personas ship as hardcoded fixtures. The user switches personas, sees pre-baked plans, and the demo tells the whole story without a runtime engine. This is the floor we guarantee.
2. **Should-have stretch (P1)** - the live milestone engine, drag-and-drop timeline, what-if sliders with sub-150 ms recompute, scenario bands, binary-search solver, goal-based bucketing, and a basic hardcoded login. These are added on top of the P0 fixtures **without changing component contracts** - fixtures and engine output share the same shape (see [ARCHITECTURE.md](./ARCHITECTURE.md) section 11).

## 4. Target Users

Six built-in personas ship as hardcoded fixtures in v1. Each carries its own age-banded risk profile, milestone set, allocation, glide path, and projection so the user can switch personas via top-bar pills and instantly see a contextual plan.

| # | Persona | Age | Risk Profile | Need | Primary Use |
|---|---|---|---|---|---|
| 1 | **Aarav the Student** | 18-22 | Very Aggressive | First-time investor, parents fund tuition, intern stipend | Learn investing, build a Rs. 500-2,000 SIP, plan grad-school corpus |
| 2 | **Aditya the Aspirer** | 25-32 | Aggressive | First home, wedding, side-hustle | Plot 2-3 near-term goals, find required SIP |
| 3 | **Priya the Provider** | 32-45 | Moderate-Aggressive | Child education + own retirement | Bucket-based allocation across overlapping goals |
| 4 | **Vikram the Late Starter** | 38-45 | Moderate | First-time saver after stable income, catching up | Aggressive SIP catch-up, telescoped retirement glide path |
| 5 | **Raj the Pre-retiree** | 50-60 | Moderate-Conservative | Glide path + retirement readiness | Visualize corpus depletion risk pre-retirement, NPS top-ups |
| 6 | **Mr. Sharma the Senior** | 60-75 | Conservative | Income generation, healthcare buffer, legacy | Display SWP-driven monthly income vs longevity-adjusted corpus |

> Advisor / pro modes are out of scope for v1.

### 4.1 Persona Snapshot Defaults (hardcoded fixtures)

Each persona below seeds the app with a complete, internally-consistent plan that the P0 build renders as-is. Once P1 ships, these same numbers become the default *inputs* to the live engine - which then recomputes projections, statuses, and narrations in real time as the user drags milestones or moves sliders.

| Field | Riya | Aditya | Priya | Vikram | Raj | Sharma |
|---|---|---|---|---|---|---|
| Current age | 20 | 28 | 38 | 42 | 55 | 65 |
| Monthly contribution (Rs.) | 1,500 | 32,000 | 55,000 | 40,000 | 75,000 | 0 (drawing) |
| Current net worth (Rs.) | 25,000 | 8,00,000 | 35,00,000 | 12,00,000 | 1,40,00,000 | 2,50,00,000 |
| **BL-optimized allocation** | 90 / 5 / 0 / 5 | 80 / 10 / 5 / 5 | 70 / 20 / 7 / 3 | 65 / 25 / 7 / 3 | 50 / 40 / 7 / 3 | 30 / 60 / 7 / 3 |
| **Investor view (BL)** | Bullish IT sector | Bullish mid-caps | Neutral | Neutral | Defensive | Income-focused |
| **Confidence level** | 80 % | 85 % | 82 % | 75 % | 88 % | 90 % |
| **Pre-tax return** | 14.2 % | 12.8 % | 11.5 % | 10.8 % | 9.2 % | 7.5 % |
| **Post-tax return** | 12.8 % | 11.4 % | 10.2 % | 9.6 % | 8.1 % | 6.8 % |
| **80C utilization** | Rs. 18 K (ELSS) | Rs. 1.5 L (ELSS + NPS) | Rs. 1.5 L | Rs. 1.2 L | Rs. 1.5 L | N/A |
| **Macro impact** | Long runway, ignore short-term | Elevated inflation hurts apartment goal | Stable macro supports plan | Catch-up harder if rates rise | Glide path benefits from stable repo | SWP yield sensitive to rate cuts |
| Headline milestones | Grad school (24, Rs. 8 L) | Apartment (32, Rs. 80 L); Studio (35, Rs. 15 L) | Child UG (50, Rs. 35 L); Retirement (60, Rs. 5 Cr) | Retirement (60, Rs. 3 Cr); Child wedding (52, Rs. 20 L) | Retirement (60, Rs. 5 Cr); Travel (62, Rs. 10 L) | Healthcare buffer (continuous, Rs. 25 L); Legacy (75, Rs. 50 L) |
| Headline status | On Track | Shortfall on apartment | On Track on child, Shortfall on retirement | Shortfall (catch-up needed) | Marginal | Income-secure for 25 yrs |
| Demo angle | "Compounding power of starting at 20" | "Sequential drawdown - house hurts business" | "Two-bucket goals overlap" | "How much extra to start at 38?" | "5-year glide path" | "SWP vs longevity" |

## 5. User Stories (MoSCoW)

> **Must** describes the hardcoded persona-fixture baseline that ships first. **Should** layers the live engine, drag-and-drop, what-if sliders, scenario bands, solver, goal-based bucketing, and basic hardcoded auth on top - all running entirely in-browser. The same component contracts are used for both, so Should features replace fixture data with engine-computed data without touching the UI tree.

### Must (P0 - baseline)

#### Core timeline and milestones

- **U1** As a user, I land on the app and see one of six pre-loaded persona plans (default: Aditya) rendered on a 60-year balance projection curve.
- **U2** As a user, I switch personas via top-bar pills (Riya / Aditya / Priya / Vikram / Raj / Sharma) and the timeline, milestones, allocation, and narration animate to the new persona within 400 ms.
- **U3** As a user, I see milestones plotted as markers on the timeline with on-track / shortfall badges driven by each persona's hardcoded status.
- **U4** As a user, I see each milestone's **inflation-adjusted cost** alongside today's-rupees cost so I'm not fooled by nominal values.
- **U5** As a user with a shortfall, I see a one-line hardcoded remediation: "Increase SIP by Rs. X or delay by Y months."

#### Black-Litterman portfolio optimization

- **U6** As a user, I see the persona's recommended **asset allocation** (equity / debt / gold / liquid) as a donut chart, derived from Black-Litterman optimization.
- **U7** As a user, I see a per-persona **glide-path chart** showing how allocation would shift across the lifeline as goals approach.
- **U8** As a user, I see an **efficient frontier mini-chart** with my persona's allocation point marked on it.
- **U9** As a user, I see the **investor views** that were used in the BL model (e.g., "Bullish on domestic mid-caps: +3 % vs equilibrium").

#### Reasoning and confidence

- **U10** As a user, I see a **reasoning trace** explaining *why* this allocation was chosen ("You're 28 with high risk capacity and aggressive appetite. BL model tilts toward mid-cap equity because...").
- **U11** As a user, I see a **confidence level** (e.g., "85 % confidence") next to each allocation, reflecting macro uncertainty and model fit.
- **U12** As a user, I see a **sensitivity callout** ("If inflation rises 1 %, your real return drops from 9.2 % to 8.1 %").

#### Macro dashboard

- **U13** As a user, I see a **macro context panel** showing current economic indicators: RBI repo rate, CPI inflation, GDP growth, crude oil price, market outlook.
- **U14** As a user, I see a one-line **macro impact summary** per persona ("Elevated inflation favors gold tilt; stable repo supports long-duration debt").
- **U15** As a user, I see **dynamic adjustment triggers** listed ("If inflation spikes > 5.5 %, shift 5 % from debt to gold").

#### Tax engine

- **U16** As a user, I see **pre-tax vs post-tax projected returns** for my persona's portfolio.
- **U17** As a user, I see a **tax impact breakdown** (LTCG, STCG, debt taxation, 80C utilization) with rupee amounts.
- **U18** As a user, I see **tax-efficient instrument recommendations** (e.g., "Max out ELSS for 80C before other equity funds").

#### Instrument recommendations

- **U19** As a user, I see a **concrete instrument list** with rupee amounts per month (e.g., "Nifty 50 Index: Rs. 8,000 / mo; Flexi-cap Fund: Rs. 10,000 / mo").

### Should (P1 - live engine + auth)

#### Live milestone engine

- **U20** As a user, I **drag a milestone marker** horizontally to change its age and the projection curve recomputes in < 150 ms.
- **U21** As a user, I **slide monthly SIP**, **inflation rate**, and **risk appetite** and the curve, milestone statuses, donut, and narration all update live.
- **U22** As a user, I add or remove milestones via an inline editor and the engine cascades all subsequent drawdowns.
- **U23** As a user, I see a **three-scenario band** (Bull / Base / Bear) on the projection curve, not a single false-precision line.
- **U24** As a user, I click "Find required SIP" on any milestone and a binary-search solver returns the minimum monthly contribution (within Rs. 100) needed to fully fund it.
- **U25** As a user, I see **goal-based bucket allocations** - my monthly SIP is split across milestone buckets, each with its own proximity-based mix; if a bucket is short, the engine auto-pulls from retirement and visibly flags it.
- **U26** As a user with a shortfall, the **gap narrator** generates a live plain-English remediation: "Rs. 73 L short. Add Rs. 1.5 L / mo, delay 18 months, or borrow Rs. 50 L."
- **U27** As a user, my **risk score** is recomputed every time I change age, milestones, or income (capacity AND appetite, not a one-time questionnaire).

#### Interaction polish

- **U28** Zoom presets: 5-year / 10-year / Full life with smooth animated transitions.
- **U29** Tap a milestone marker to open a side panel with the recommended per-goal bucket allocation (proximity-based) and instrument list.
- **U30** What-if pills per persona (e.g., for Aditya: "32 K SIP" / "48 K SIP" / "with home loan") provide quick presets that snap the engine to a known starting point.
- **U31** Persona pills include a one-line headline ("Compounding power of starting at 20").

#### Basic auth (hardcoded)

- **U32** As a user, I see a **login screen on first visit** with username + password fields. Credentials are validated against a hardcoded list shipped in `data/users.ts`. No database, no JWT, no hashing - this is demo-grade auth only.
- **U33** As a logged-in user, my session (just the username) persists in `localStorage` and survives page reload.
- **U34** As a logged-in user, the app **lands on my associated persona** automatically (e.g., user `aditya / demo123` -> Aditya persona).
- **U35** As a logged-in user, I see a **logout button** in the header that clears the session and returns me to the login screen.
- **U36** As an unauthenticated visitor, I cannot reach the planner - all routes redirect to `/login`.

### Could (P2)

- **U37** PDF export of the current view (persona snapshot + curve + allocation + reasoning + tax breakdown).
- **U38** Compare any two personas side-by-side on a stacked timeline.
- **U39** Light / dark theme toggle.
- **U40** Save / load multiple plans per user (still client-side, keyed by username in `localStorage`).
- **U41** "Remember me" toggle on the login screen (default: on).
- **U42** Monte Carlo simulation visualization showing probability distribution of outcomes.
- **U43** Historical backtest view: "If you had followed this plan since 2010, here's what would have happened."

### Won't (v1)

- Real authentication: no database, no password hashing, no JWT, no OAuth, no password reset flow.
- Real broker integration / live portfolio sync.
- Server-side persistence of plans or user data.
- Tax optimization beyond 80C / 80CCD(1B) display hints.
- Multi-currency.
- Mobile native apps.

## 6. Functional Requirements

### 6.1 Baseline - Core (P0)

| ID | Requirement | Priority |
|---|---|---|
| FR-1 | Six built-in persona fixtures (Riya / Aditya / Priya / Vikram / Raj / Sharma) shipped as TypeScript modules with full plan data | P0 |
| FR-2 | Persona switcher (top-bar pills) that swaps the active fixture and animates the timeline / allocation / narration | P0 |
| FR-3 | Timeline view: SVG balance projection curve sourced from `persona.projection[]` | P0 |
| FR-4 | Milestone markers with hardcoded status badges (on-track / shortfall / surplus) sourced from `persona.milestones[]` | P0 |
| FR-5 | Inflation-adjusted cost shown per milestone (precomputed in fixture) | P0 |

### 6.2 Baseline - Black-Litterman Portfolio Optimization (P0)

| ID | Requirement | Priority |
|---|---|---|
| FR-6 | Allocation donut chart driven by `persona.allocation` (pre-optimized via Black-Litterman offline) | P0 |
| FR-7 | Glide-path chart driven by `persona.glidePath[]` showing allocation shift as goals approach | P0 |
| FR-8 | Efficient frontier mini-chart with persona's allocation point marked (pre-computed SVG path) | P0 |
| FR-9 | Investor views panel: list of views used in BL model (e.g., "Bullish domestic mid-caps: +3 % vs equilibrium") sourced from `persona.blViews[]` | P0 |
| FR-10 | Per-persona `blOptimization` fixture containing: equilibrium weights, posterior returns, covariance matrix summary, final allocation rationale | P0 |

### 6.3 Baseline - Reasoning and Confidence (P0)

| ID | Requirement | Priority |
|---|---|---|
| FR-11 | Reasoning trace component rendering `persona.reasoningTrace` - plain-English explanation of allocation choice | P0 |
| FR-12 | Confidence level badge (e.g., "85 % confidence") sourced from `persona.confidenceLevel` | P0 |
| FR-13 | Sensitivity callout component rendering `persona.sensitivityAnalysis[]` (e.g., "If inflation +1 %, real return drops 1.1 pp") | P0 |
| FR-14 | Tooltip on each allocation slice explaining *why* this weight (links to reasoning trace) | P0 |

### 6.4 Baseline - Macro Dashboard (P0)

| ID | Requirement | Priority |
|---|---|---|
| FR-15 | Macro context panel showing current economic indicators: `macroSnapshot = { repoRate, inflation, gdpGrowth, crudeOil, marketOutlook }` (Apr 2026 hardcoded) | P0 |
| FR-16 | Macro impact summary per persona: `persona.macroImpact` one-liner explaining how macro affects this persona's allocation | P0 |
| FR-17 | Dynamic adjustment triggers list: `persona.rebalanceTriggers[]` showing what macro changes would cause what rebalance (pre-authored) | P0 |
| FR-18 | Macro trend mini-charts (sparklines) for inflation and repo rate showing 12-month history (hardcoded) | P0 |

### 6.5 Baseline - Tax Engine (P0, client-side)

| ID | Requirement | Priority |
|---|---|---|
| FR-19 | Tax rules module `lib/tax/indianTax.ts` implementing LTCG (12.5 % > Rs. 1.25 L), STCG (20 %), debt slab rate, gold indexation | P0 |
| FR-20 | Pre-tax vs post-tax return display per persona: `persona.returns = { preTax, postTax, taxDrag }` | P0 |
| FR-21 | Tax impact breakdown panel: LTCG amount, STCG amount, debt tax, 80C utilization, net tax drag Rs. | P0 |
| FR-22 | Tax-efficient instrument recommendations: flag instruments that maximize 80C / 80CCD(1B) before others | P0 |
| FR-23 | 80C utilization meter showing how much of Rs. 1.5 L limit is consumed by recommended ELSS + PPF + NPS | P0 |

### 6.6 Baseline - Instrument Recommendations (P0)

| ID | Requirement | Priority |
|---|---|---|
| FR-24 | Instrument list component rendering `persona.instruments[]` with name, category, monthly Rs. allocation | P0 |
| FR-25 | Instruments grouped by asset class (Equity / Debt / Gold / Liquid) with subtotals | P0 |
| FR-26 | Per-instrument rationale tooltip sourced from `instrument.rationale` | P0 |

### 6.7 Live Engine (P1)

| ID | Requirement | Priority |
|---|---|---|
| FR-27 | Pure-TS forward-simulation engine running monthly steps from `currentAge` -> 90, sequential drawdowns, in-browser only | P1 |
| FR-28 | Inflation adjustment per milestone using user-configurable rate (default 5.5 %, RBI 4.6 % near-term blend) | P1 |
| FR-29 | Three-scenario simulator (Bull / Base / Bear) producing parallel projections rendered as a band | P1 |
| FR-30 | Binary-search solver `findRequiredContribution(milestone)` to within Rs. 100 precision | P1 |
| FR-31 | Goal-based bucket allocator: SIP weighted across buckets by `cost / yearsToGoal`, proximity-based de-risking, auto-pull from retirement on shortfall with explicit flag | P1 |
| FR-32 | Dynamic risk score = `min(capacity, appetite)`; capacity blends age, time horizon, cushion ratio, dependents, job stability; recomputed on every input change | P1 |
| FR-33 | Drag-and-drop milestone repositioning with snap-to-month and live recompute | P1 |
| FR-34 | What-if sliders (SIP, inflation, risk appetite) with debounced (150 ms) recompute | P1 |
| FR-35 | Live gap-narrator generating plain-English remediation from current shortfall | P1 |
| FR-36 | Coordinate-transform zoom (no DOM reflow) with spring / cubic easing - 5 yr / 10 yr / Full | P1 |
| FR-37 | Side panel on milestone click showing per-goal bucket allocation and instrument list | P1 |

### 6.8 Auth (P1, hardcoded only)

| ID | Requirement | Priority |
|---|---|---|
| FR-38 | Login screen at `/login` with username + password fields, validates against a hardcoded list in `data/users.ts` | P1 |
| FR-39 | Hardcoded user list of at least 6 entries (one per persona): `[{ username, password, personaId }]` - plain text, no hashing | P1 |
| FR-40 | Session persisted to `localStorage` under key `v1.horizon26.session = { username }`; survives page reload | P1 |
| FR-41 | Route guard: any planner route redirects to `/login` when no session exists | P1 |
| FR-42 | On successful login, set the active persona to the user's `personaId` and route to `/` | P1 |
| FR-43 | Logout button in header clears the session and routes to `/login` | P1 |
| FR-44 | Login form: simple client-side validation (non-empty fields), generic error message ("Invalid credentials") - do NOT leak which field was wrong | P1 |

### 6.9 Persistence and Polish (P2)

| ID | Requirement | Priority |
|---|---|---|
| FR-45 | Persist `selectedPersonaId`, `selectedVariantId`, `zoom`, last engine params to `localStorage` keyed by username | P2 |
| FR-46 | Persona snapshot card with key headline numbers (current age, SIP, net worth, status, confidence) | P2 |
| FR-47 | "Remember me" toggle on login (default on); when off, session lives in `sessionStorage` instead | P2 |

## 7. Non-Functional Requirements

| Category | Target |
|---|---|
| Performance (P0) | Persona switch -> first paint <= 100 ms; full animated transition <= 400 ms |
| Performance (P1) | Live engine recompute <= 30 ms for 60-yr monthly sim (720 steps) on mid-range laptop; input -> repaint <= 200 ms p95 (incl. 150 ms debounce) |
| Performance (P1) | Three-scenario parallel sim <= 90 ms; binary-search solver <= 250 ms (<= 30 iterations) |
| Animation | 60 fps for persona switch, zoom, drag, slider, and variant swap |
| Accessibility | WCAG 2.1 AA, keyboard-navigable persona pills + milestones + login form, ARIA on markers + draggable items, focus trap on login |
| Bundle size | <= 220 KB gzipped JS for `/` route (P0 baseline ~ 180 KB; engine adds ~ 40 KB) |
| Offline | App fully usable without network after first load |
| Mobile | Responsive >= 360 px wide; horizontally scrollable timeline; touch-tappable markers; touch-drag for milestone reposition |
| Privacy | All numbers and credentials are client-side; no network calls leave the browser; hardcoded creds are visible in the bundle and explicitly demo-only |
| Security | The hardcoded auth is NOT real security. The app must show a visible "Demo auth - do not use real credentials" banner on the login screen |

## 8. Success Metrics

| Metric | Target |
|---|---|
| Time-to-first-paint of default persona (post-login) | < 1.5 s on cold load |
| % of demo viewers who switch personas at least once | > 80 % |
| % who explore the reasoning trace / "why this allocation" | > 60 % |
| % who view the macro dashboard | > 50 % |
| % who check the tax impact breakdown | > 40 % |
| % who try a what-if interaction (slider, drag, or variant pill) - P1 only | > 60 % |
| % who hit "Find required SIP" on a milestone - P1 only | > 30 % |
| Lighthouse Performance | >= 90 |
| Demo coherence (judge score, P0) | All 19 must-have stories demoable in 7 min |
| Demo coherence (judge score, P0+P1) | Full live-engine narrative demoable in 10 min |
| "Aha moment" metric | > 70 % of viewers say "I understand *why* this allocation, not just *what*" |

## 9. Assumptions and Constraints

### 9.1 Build constraints

- **Frontend-only build**: no backend, no API, no database, no server, no live ML inference. All complex computation (Black-Litterman optimization, macro forecasting) runs **offline at fixture-authoring time**. The shipped app renders pre-computed results.
- **One-day hackathon timebox**: P0 must ship in one day. P1 (live engine + auth) is stretch.
- Existing scaffold uses Tailwind v4 PostCSS plugin and Next 16 App Router (per `horizon26/AGENTS.md`).

### 9.2 Black-Litterman MPT

- Each persona's allocation is pre-optimized using Black-Litterman with:
  - **Market equilibrium weights** derived from CAPM (market-cap weights for Nifty 50, debt indices, gold, liquid funds)
  - **Investor views** per persona (e.g., "Aditya is bullish on mid-caps: +3 % vs equilibrium")
  - **Confidence in views** (tau = 0.05, omega scaled by view confidence)
  - **Posterior expected returns** blended from views + equilibrium
  - **Mean-variance optimization** on posterior to produce efficient frontier
  - **Risk-appropriate point** on frontier selected based on persona's risk score
- The optimization runs in a **Python notebook offline** (not shipped). Output is pasted into TypeScript fixtures.
- The shipped app shows the allocation + reasoning trace + efficient frontier SVG, but does **not** re-run BL at runtime.

### 9.3 Macro forecasting

- Apr 2026 macro snapshot is **hardcoded** (no live API calls):
  - RBI repo rate: 5.25 %
  - CPI inflation: 4.6 % (RBI FY27 projection)
  - GDP growth: 6.9 %
  - Crude oil: > $100/bbl
  - Market outlook: range-bound H1, potential rally H2 (per Apr 2026 consensus)
- The macro layer shows **what would happen if** triggers fire (e.g., "If inflation > 5.5 %, shift 5 % from debt to gold") but does **not** actually rebalance at runtime.
- Macro impact on each persona is pre-authored as a one-liner narrative.

### 9.4 Tax engine

- Runs **client-side** with hardcoded Indian tax rules (FY 2025-26):
  - LTCG on equity: 12.5 % above Rs. 1.25 L (holding > 1 yr)
  - STCG on equity: 20 % (holding <= 1 yr)
  - Debt fund taxation: slab rate (post-2023, no indexation)
  - Gold / SGB: LTCG 20 % with indexation (> 3 yr) or slab rate
  - 80C: ELSS, PPF, NPS up to Rs. 1.5 L
  - 80CCD(1B): additional Rs. 50 K for NPS
- Tax calculations are **pre-computed per persona** and stored in fixtures. The client-side tax module is available for P1 live recompute but is **not required for P0**.

### 9.5 Reasoning and confidence

- **Reasoning traces** are pre-authored narratives stored in `persona.reasoningTrace`.
- **Confidence levels** are pre-computed based on:
  - Model fit (BL posterior uncertainty)
  - Macro forecast uncertainty (higher oil volatility -> lower confidence)
  - Time horizon (longer horizon -> slightly lower confidence)
- **Sensitivity analysis** is pre-computed ("If X changes by Y, return changes by Z").
- The shipped app renders these; it does **not** generate them at runtime.

### 9.6 Auth (hardcoded)

- The username / password list lives in a TypeScript module shipped in the bundle.
- This is demo-grade auth; users are explicitly told not to use real credentials.
- No DB connection, no JWT, no password hashing, no OAuth.

### 9.7 Disclaimers

- All numbers are illustrative defaults; the UI shows a "Not financial advice" disclaimer.
- Macro forecasts are point-in-time (Apr 2026) and will become stale.
- BL optimization is based on assumed views; actual market behavior may differ.

### 9.8 Hardcoded User List (initial)

| Username | Password | Lands on |
|---|---|---|
| `riya` | `demo123` | Riya the Student |
| `aditya` | `demo123` | Aditya the Aspirer |
| `priya` | `demo123` | Priya the Provider |
| `vikram` | `demo123` | Vikram the Late Starter |
| `raj` | `demo123` | Raj the Pre-retiree |
| `sharma` | `demo123` | Mr. Sharma the Senior |
| `demo` | `demo` | Aditya (default demo user for judges) |

These credentials are non-secret and will be visible in the JS bundle. The `/login` screen displays them on a "Demo accounts" panel.

## 10. Open Questions

1. **Persona count** - confirm the 6 personas above; trim to 4 if hackathon time pressure demands.
2. **BL views authoring** - how many investor views per persona? Recommendation: 1-2 views max to keep fixtures manageable.
3. **Efficient frontier granularity** - show full frontier SVG or just the selected point? Recommendation: full frontier mini-chart (pre-rendered SVG path).
4. **Tax slab assumption** - assume 30 % slab for all personas or persona-specific slabs? Recommendation: 30 % for simplicity.
5. **Confidence calibration** - how to explain 85 % vs 75 % confidence to users? Recommendation: tooltip with one-line explanation.
6. **Macro staleness** - add "as of Apr 2026" timestamp to macro panel? Recommendation: yes, prominently.
7. **Disclaimer placement** - footer, modal-on-load, or inline tooltip? Recommendation: subtle footer + per-number tooltip + login-screen demo-auth banner.
8. **Engine-first vs fixtures-first** - if hackathon time is tight, do we ship P0 fixtures only? Recommendation: P0 first, then P1 incrementally.
