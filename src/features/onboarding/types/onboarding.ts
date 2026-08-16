/**
 * Ordered steps of the guided first-run experience.
 *
 * `account` is implicitly satisfied by an authenticated session, so the
 * interactive flow begins at `career-goal`. `finish` marks completion.
 */
export const ONBOARDING_STEPS = [
  "account",
  "career-goal",
  "build-profile",
  "review-path",
  "finish",
] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

/**
 * Onboarding progress metadata. This is deliberately separate from
 * career/readiness state: changing a career after onboarding must never reset
 * `completed`.
 */
export type OnboardingState = {
  completed: boolean;
  /** The furthest step the user reached, used to resume an interrupted run. */
  step: OnboardingStep;
};
