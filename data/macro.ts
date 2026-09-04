import type { MacroSnapshot } from "@/lib/types";

export const macroSnapshot: MacroSnapshot = {
  asOf: "Apr 2026",
  repoRate: {
    value: 5.25,
    delta: -0.25,
    trend: [6.5, 6.5, 6.25, 6.0, 6.0, 5.75, 5.75, 5.5, 5.5, 5.25, 5.25, 5.25],
  },
  inflation: {
    value: 4.6,
    delta: -0.3,
    trend: [5.4, 5.3, 5.1, 5.0, 4.9, 4.8, 4.9, 4.8, 4.7, 4.6, 4.6, 4.6],
  },
  gdpGrowth: {
    value: 6.9,
    delta: 0.2,
    trend: [6.4, 6.5, 6.6, 6.7, 6.7, 6.8, 6.8, 6.9, 6.9, 6.9, 6.9, 6.9],
  },
  crudeOil: {
    value: 102,
    delta: 6.5,
    trend: [78, 82, 84, 86, 90, 92, 94, 95, 97, 99, 101, 102],
  },
  marketOutlook: "Range-bound H1, potential rally H2 — geopolitical risk elevated.",
};
