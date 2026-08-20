import { describe, expect, it } from "vitest";

import type { RecommendationScenarioResult } from
  "@/features/scenario-simulator/types/scenario";

import { whatIfMode } from "./what-if-mode";

const scenario = {
  id: "scenario-product-engineer-rec",
} as RecommendationScenarioResult;

describe("whatIfMode", () => {
  it("uses recommendation ScenarioPreview when a scenario is present", () => {
    expect(whatIfMode(scenario)).toBe("recommendation");
    expect(whatIfMode(scenario)).not.toBe("opportunity");
  });

  it("uses opportunity flow when no scenario is present", () => {
    expect(whatIfMode(null)).toBe("opportunity");
  });
});
