import { describe, expect, it } from "vitest";

import { completeOnboarding, initialOnboarding } from
  "@/features/onboarding/services/onboarding-state";

import { createExploredDemoOnboarding } from "../data/demo-resume";

describe("demo reset state", () => {
  it("restores the public demo to the chooser/onboarding invariants", () => {
    const explored = createExploredDemoOnboarding();
    const mutated = completeOnboarding(initialOnboarding());

    expect(explored).toEqual(mutated);
    expect(explored.completed).toBe(true);
    expect(explored.step).toBe("finish");
  });
});
