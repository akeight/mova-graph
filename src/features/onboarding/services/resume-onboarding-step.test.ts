import { describe, expect, it } from "vitest";

import type { StudentProfile } from
  "@/features/student-profile/types/student-profile";

import {
  hasProfileEvidence,
  resumeOnboardingStep,
} from "./resume-onboarding-step";

const emptyProfile: StudentProfile = {
  id: "student-1",
  name: "jordan",
  courses: [],
  experiences: [],
  skills: [],
};

describe("resumeOnboardingStep", () => {
  it("starts incomplete users with no evidence at profile setup", () => {
    expect(
      resumeOnboardingStep(
        { completed: false, step: "career-goal" },
        emptyProfile,
      ),
    ).toBe("build-profile");
  });

  it("does not reset completed onboarding", () => {
    expect(
      resumeOnboardingStep(
        { completed: true, step: "finish" },
        emptyProfile,
      ),
    ).toBe("finish");
  });

  it("keeps later incomplete steps", () => {
    expect(
      resumeOnboardingStep(
        { completed: false, step: "review-path" },
        emptyProfile,
      ),
    ).toBe("review-path");
  });
});

describe("hasProfileEvidence", () => {
  it("is false for an empty profile", () => {
    expect(hasProfileEvidence(emptyProfile)).toBe(false);
  });
});
