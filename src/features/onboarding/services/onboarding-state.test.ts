import { describe, expect, it } from "vitest";

import {
  advanceOnboarding,
  completeOnboarding,
  initialOnboarding,
  preserveOnboardingOnRoleChange,
} from "./onboarding-state";

describe("onboarding-state", () => {
  it("starts incomplete at the career-goal step", () => {
    expect(initialOnboarding()).toEqual({
      completed: false,
      step: "career-goal",
    });
  });

  it("advances forward through steps", () => {
    const advanced = advanceOnboarding(
      initialOnboarding(),
      "build-profile",
    );

    expect(advanced.step).toBe("build-profile");
    expect(advanced.completed).toBe(false);
  });

  it("never regresses to an earlier step", () => {
    const state = advanceOnboarding(
      initialOnboarding(),
      "review-path",
    );

    const regressed = advanceOnboarding(state, "career-goal");

    expect(regressed.step).toBe("review-path");
  });

  it("persists completion", () => {
    const completed = completeOnboarding(
      advanceOnboarding(initialOnboarding(), "review-path"),
    );

    expect(completed.completed).toBe(true);
    expect(completed.step).toBe("finish");
  });

  it("does not reset onboarding when the career changes after completion", () => {
    const completed = completeOnboarding(initialOnboarding());

    const afterRoleChange =
      preserveOnboardingOnRoleChange(completed);

    expect(afterRoleChange.completed).toBe(true);
    expect(afterRoleChange).toEqual(completed);
  });
});
