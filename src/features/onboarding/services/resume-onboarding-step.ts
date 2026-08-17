import type { StudentProfile } from
  "@/features/student-profile/types/student-profile";

import type {
  OnboardingState,
  OnboardingStep,
} from "../types/onboarding";

export function hasProfileEvidence(
  profile: StudentProfile,
): boolean {
  return (
    profile.courses.length > 0 ||
    profile.experiences.length > 0 ||
    profile.skills.length > 0
  );
}

export function resumeOnboardingStep(
  state: OnboardingState,
  profile: StudentProfile,
): OnboardingStep {
  if (state.completed) {
    return state.step;
  }

  if (state.step === "career-goal" && !hasProfileEvidence(profile)) {
    return "build-profile";
  }

  return state.step;
}
