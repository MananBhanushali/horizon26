import type { Persona, Allocation } from "./types";
import type { UserInvestment } from "@/components/providers/AppProvider";

export type PortfolioRiskMetrics = {
  cagr: number;           // Compounded Annual Growth Rate (e.g. 12.4%)
  beta: number;           // Portfolio Beta vs NIFTY 50 (e.g. 0.95)
  alpha: number;          // Jensen's Alpha vs NIFTY 50 (e.g. 1.8%)
  sharpeRatio: number;    // Sharpe Ratio: (Rp - Rf) / Volatility (e.g. 1.42)
  sortinoRatio: number;   // Sortino Ratio: (Rp - Rf) / Downside Volatility (e.g. 1.95)
  volatility: number;     // Annualized Standard Deviation (e.g. 13.8%)
  maxDrawdown: number;    // Estimated historical max drawdown (e.g. -18.5%)
  treynorRatio: number;   // Treynor Ratio: (Rp - Rf) / Beta
  defensiveRatio: number; // Cash + Debt + Gold buffer %
};

// Benchmark parameters for Indian Financial Market (NIFTY 50 + RBI Repo)
export const MARKET_BENCHMARK = {
  name: "NIFTY 50",
  riskFreeRate: 6.5,      // RBI Repo / Sovereign T-Bill rate in %
  marketReturn: 12.0,     // NIFTY 50 Long-term expected return in %
  marketVolatility: 15.5, // NIFTY 50 Annualized Volatility in %
};

/**
 * Estimates the beta of an investment based on its category and name
 */
export function estimateAssetBeta(name: string, category: UserInvestment["category"]): number {
  const lower = name.toLowerCase();
  
  if (category === "Equity") {
    if (lower.includes("small") || lower.includes("micro")) return 1.38;
    if (lower.includes("mid") || lower.includes("emerging")) return 1.24;
    if (lower.includes("it") || lower.includes("tech") || lower.includes("pharma") || lower.includes("sector")) return 1.18;
    if (lower.includes("large") || lower.includes("nifty 50") || lower.includes("bluechip") || lower.includes("sensex")) return 1.00;
    if (lower.includes("flexi") || lower.includes("multi")) return 1.08;
    return 1.10;
  }
  
  if (category === "Debt") {
    if (lower.includes("long") || lower.includes("gilt")) return 0.28;
    if (lower.includes("corporate") || lower.includes("credit")) return 0.20;
    if (lower.includes("short") || lower.includes("liquid")) return 0.08;
    return 0.15;
  }
  
  if (category === "Gold") {
    return 0.22; // Low correlation with equities
  }
  
  // Liquid / Cash
  return 0.02;
}

/**
 * Estimates asset volatility (standard deviation in %)
 */
export function estimateAssetVolatility(category: UserInvestment["category"], beta: number): number {
  if (category === "Equity") {
    return Math.round((MARKET_BENCHMARK.marketVolatility * beta * 1.05) * 10) / 10;
  }
  if (category === "Debt") {
    return 5.2;
  }
  if (category === "Gold") {
    return 13.5;
  }
  return 1.5; // Liquid
}

/**
 * Compute portfolio risk & performance metrics from a list of user investments
 */
export function calculateInvestmentsMetrics(investments: UserInvestment[]): PortfolioRiskMetrics {
  const totalValue = investments.reduce((acc, i) => acc + Math.max(0, i.currentValue), 0);
  
  if (totalValue <= 0 || investments.length === 0) {
    return {
      cagr: 10.5,
      beta: 1.0,
      alpha: 0.0,
      sharpeRatio: 0.9,
      sortinoRatio: 1.2,
      volatility: 12.0,
      maxDrawdown: -15.0,
      treynorRatio: 4.0,
      defensiveRatio: 20.0,
    };
  }

  let weightedReturn = 0;
  let weightedBeta = 0;
  let weightedVolSq = 0;
  let defensiveValue = 0;
  let equityValue = 0;
  let goldValue = 0;
  let debtValue = 0;

  investments.forEach((inv) => {
    const val = Math.max(0, inv.currentValue);
    const weight = val / totalValue;
    const beta = estimateAssetBeta(inv.name, inv.category);
    const vol = estimateAssetVolatility(inv.category, beta);

    weightedReturn += weight * inv.annualReturn;
    weightedBeta += weight * beta;
    weightedVolSq += weight * weight * (vol * vol);

    if (inv.category === "Equity") equityValue += val;
    if (inv.category === "Debt") debtValue += val;
    if (inv.category === "Gold") goldValue += val;
    if (inv.category === "Liquid" || inv.category === "Debt" || inv.category === "Gold") {
      defensiveValue += val;
    }
  });

  // Diversification benefit factor reduces total portfolio variance
  const diversificationFactor = investments.length > 1 ? 0.82 : 1.0;
  const portfolioVolatility = Math.max(2, Math.sqrt(weightedVolSq) * diversificationFactor * 1.5);
  const downsideVolatility = portfolioVolatility * 0.68;

  const rf = MARKET_BENCHMARK.riskFreeRate;
  const rm = MARKET_BENCHMARK.marketReturn;
  
  // CAGR: compounded growth rate over time
  const cagr = Number(weightedReturn.toFixed(2));
  const beta = Number(Math.max(0.05, weightedBeta).toFixed(2));
  
  // Jensen's Alpha = Rp - [Rf + Beta * (Rm - Rf)]
  const expectedCapmReturn = rf + beta * (rm - rf);
  const alpha = Number((cagr - expectedCapmReturn).toFixed(2));
  
  // Sharpe = (Rp - Rf) / Volatility
  const sharpeRatio = Number(((cagr - rf) / Math.max(1, portfolioVolatility)).toFixed(2));
  
  // Sortino = (Rp - Rf) / Downside Deviation
  const sortinoRatio = Number(((cagr - rf) / Math.max(0.5, downsideVolatility)).toFixed(2));
  
  // Max Drawdown estimate based on asset class historical drawdown exposures
  const equityWeight = equityValue / totalValue;
  const debtWeight = debtValue / totalValue;
  const goldWeight = goldValue / totalValue;
  const maxDrawdown = -Number((equityWeight * 34 + debtWeight * 6 + goldWeight * 14).toFixed(1));
  
  // Treynor = (Rp - Rf) / Beta
  const treynorRatio = Number(((cagr - rf) / Math.max(0.1, beta)).toFixed(2));
  const defensiveRatio = Number(((defensiveValue / totalValue) * 100).toFixed(1));

  return {
    cagr,
    beta,
    alpha,
    sharpeRatio,
    sortinoRatio,
    volatility: Number(portfolioVolatility.toFixed(1)),
    maxDrawdown,
    treynorRatio,
    defensiveRatio,
  };
}

/**
 * Compute portfolio risk & performance metrics from a persona's allocation and return
 */
export function calculateAllocationMetrics(
  allocation: Allocation,
  preTaxReturn: number = 11.5
): PortfolioRiskMetrics {
  const equityW = (allocation.equity || 0) / 100;
  const debtW = (allocation.debt || 0) / 100;
  const goldW = (allocation.gold || 0) / 100;
  const liquidW = (allocation.liquid || 0) / 100;

  // Weighted Beta
  const beta = Number((equityW * 1.12 + debtW * 0.15 + goldW * 0.22 + liquidW * 0.02).toFixed(2));
  
  // Volatility
  const rawVol = Math.sqrt(
    Math.pow(equityW * 18, 2) +
    Math.pow(debtW * 5, 2) +
    Math.pow(goldW * 13, 2) +
    Math.pow(liquidW * 1.5, 2)
  );
  const volatility = Number(Math.max(2, rawVol * 1.25).toFixed(1));
  const downsideVol = volatility * 0.68;

  const rf = MARKET_BENCHMARK.riskFreeRate;
  const rm = MARKET_BENCHMARK.marketReturn;

  const cagr = Number(preTaxReturn.toFixed(2));
  const expectedCapm = rf + beta * (rm - rf);
  const alpha = Number((cagr - expectedCapm).toFixed(2));
  
  const sharpeRatio = Number(((cagr - rf) / Math.max(1, volatility)).toFixed(2));
  const sortinoRatio = Number(((cagr - rf) / Math.max(0.5, downsideVol)).toFixed(2));
  const maxDrawdown = -Number((equityW * 34 + debtW * 6 + goldW * 14).toFixed(1));
  const treynorRatio = Number(((cagr - rf) / Math.max(0.1, beta)).toFixed(2));
  const defensiveRatio = Number(((debtW + goldW + liquidW) * 100).toFixed(1));

  return {
    cagr,
    beta,
    alpha,
    sharpeRatio,
    sortinoRatio,
    volatility,
    maxDrawdown,
    treynorRatio,
    defensiveRatio,
  };
}
