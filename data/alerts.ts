import type { AlertItem, Persona } from "@/lib/types";

export function buildAlerts(persona: Persona): AlertItem[] {
  const now = Date.now();
  const ago = (m: number) => new Date(now - m * 60 * 1000).toISOString();
  const base: AlertItem[] = [
    {
      id: "macro-1",
      type: "macro",
      severity: "warning",
      title: "Crude oil > $100/bbl",
      body: "Geopolitical risk elevated. Apartment-bucket cost inflation may rise. Monitor for trigger threshold (5.5% CPI).",
      timestamp: ago(8),
    },
    {
      id: "macro-2",
      type: "macro",
      severity: "info",
      title: "RBI repo unchanged at 5.25%",
      body: "MPC held rates; long-duration debt sleeve remains favored. No action required.",
      timestamp: ago(32),
    },
    {
      id: "tax-1",
      type: "tax",
      severity: "info",
      title: "80C nudge — ELSS tranche due",
      body: `Allocate Rs. ${persona.taxBreakdown.section80c.toLocaleString("en-IN")} to ELSS / NPS this FY to fully consume the deduction.`,
      timestamp: ago(124),
    },
  ];

  const shortMs = persona.milestones.filter((m) => m.status === "SHORTFALL");
  for (const m of shortMs) {
    base.unshift({
      id: `short-${m.id}`,
      type: "shortfall",
      severity: "critical",
      title: `Shortfall: ${m.name}`,
      body: `Rs. ${(m.shortfall / 100000).toFixed(1)} L gap by age ${m.age}. ${m.remediation}`,
      timestamp: ago(2),
    });
  }

  if (persona.id === "vikram" || persona.id === "priya") {
    base.unshift({
      id: "risk-1",
      type: "risk",
      severity: "warning",
      title: "Risk capacity below appetite",
      body: "Capacity caps allocation despite higher stated appetite. Consider raising income, lowering dependents-on-corpus, or accepting capacity-bound mix.",
      timestamp: ago(45),
    });
  }
  return base;
}
