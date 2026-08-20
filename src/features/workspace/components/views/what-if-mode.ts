import type { RecommendationScenarioResult } from "@/features/scenario-simulator/types/scenario";

export type WhatIfMode = "recommendation" | "opportunity";

export function whatIfMode(
  scenario: RecommendationScenarioResult | null,
): WhatIfMode {
  return scenario ? "recommendation" : "opportunity";
}
