export type RiskBand = "Conservative" | "Moderate-Conservative" | "Moderate" | "Moderate-Aggressive" | "Aggressive" | "Very Aggressive";
export type ConfidenceLabel = "Low" | "Medium" | "High";
export type MilestoneStatus = "ON_TRACK" | "SHORTFALL" | "SURPLUS";
export type MilestoneCategory =
  | "education"
  | "home"
  | "wedding"
  | "vehicle"
  | "business"
  | "retirement"
  | "travel"
  | "healthcare"
  | "legacy"
  | "child";

export type Allocation = {
  equity: number;
  debt: number;
  gold: number;
  liquid: number;
};

export type Milestone = {
  id: string;
  name: string;
  category: MilestoneCategory;
  age: number;
  nominalCost: number;
  inflatedCost: number;
  projectedBalance: number;
  shortfall: number;
  status: MilestoneStatus;
  bucket: Allocation;
  remediation: string;
  remediationOptions: { label: string; impact: string }[];
};

export type ProjectionPoint = {
  age: number;
  base: number;
  bull: number;
  bear: number;
};

export type GlidePoint = {
  age: number;
  equity: number;
  debt: number;
  gold: number;
  liquid: number;
};

export type BLView = {
  asset: string;
  equilibrium: number; // %
  view: number; // %
  confidence: number; // 0..1
  rationale: string;
};

export type EfficientFrontierPoint = {
  risk: number; // std dev
  return: number; // %
  selected?: boolean;
};

export type RebalanceTrigger = {
  condition: string;
  action: string;
  rationale: string;
};

export type Sensitivity = {
  variable: string;
  delta: string;
  impact: string;
};

export type Instrument = {
  id: string;
  name: string;
  category: "Equity" | "Debt" | "Gold" | "Liquid";
  subCategory: string;
  monthly: number;
  riskBand: RiskBand;
  taxBenefit: string;
  rationale: string;
};

export type Scenario = {
  id: "bull" | "base" | "bear";
  label: string;
  endCorpus: number;
  hitRate: number; // 0..1 milestone hit rate
  shortfallDelta: number;
  keyRisk: string;
  description: string;
};

export type Persona = {
  id: "riya" | "aditya" | "priya" | "vikram" | "raj" | "sharma";
  name: string;
  title: string;
  tagline: string;
  age: number;
  retirementAge: number;
  monthlyContribution: number;
  netWorth: number;
  annualIncome: number;
  dependents: number;
  jobStability: "Low" | "Medium" | "High";
  riskBand: RiskBand;
  riskScore: number;
  riskCapacity: number;
  riskAppetite: number;
  confidenceLevel: number;
  confidenceLabel: ConfidenceLabel;
  planConfidence: number;
  headlineStatus: string;
  status: "ON_TRACK" | "SHORTFALL" | "SURPLUS" | "MARGINAL";
  aggregateShortfall: number;
  allocation: Allocation;
  glidePath: GlidePoint[];
  blViews: BLView[];
  efficientFrontier: EfficientFrontierPoint[];
  selectedFrontierPoint: { risk: number; return: number };
  reasoningTrace: string;
  macroImpact: string;
  rebalanceTriggers: RebalanceTrigger[];
  sensitivityAnalysis: Sensitivity[];
  preTaxReturn: number;
  postTaxReturn: number;
  taxDrag: number;
  taxBreakdown: {
    ltcg: number;
    stcg: number;
    debtTax: number;
    section80c: number;
    section80ccd1b: number;
    netTax: number;
  };
  instruments: Instrument[];
  milestones: Milestone[];
  projection: ProjectionPoint[];
  scenarios: Scenario[];
};

export type MacroSnapshot = {
  asOf: string;
  repoRate: { value: number; trend: number[]; delta: number };
  inflation: { value: number; trend: number[]; delta: number };
  gdpGrowth: { value: number; trend: number[]; delta: number };
  crudeOil: { value: number; trend: number[]; delta: number };
  marketOutlook: string;
};

export type AlertItem = {
  id: string;
  type: "risk" | "shortfall" | "macro" | "tax";
  severity: "info" | "warning" | "critical";
  title: string;
  body: string;
  timestamp: string;
};

export type DemoUser = {
  username: string;
  password: string;
  personaId: Persona["id"];
};
