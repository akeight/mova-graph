import {
  ONBOARDING_STEPS,
  type OnboardingState,
  type OnboardingStep,
} from "../types/onboarding";

export function initialOnboarding(): OnboardingState {
  return {
    completed: false,
    step: "build-profile",
  };
}

function stepIndex(step: OnboardingStep): number {
  return ONBOARDING_STEPS.indexOf(step);
}

/**
 * Moves onboarding forward to `nextStep`, never regressing to an earlier step.
 * Completion is left untouched (it is only set by `completeOnboarding`).
 */
export function advanceOnboarding(
  state: OnboardingState,
  nextStep: OnboardingStep,
): OnboardingState {
  const furthestStep =
    stepIndex(nextStep) > stepIndex(state.step)
      ? nextStep
      : state.step;

  return {
    completed: state.completed,
    step: furthestStep,
  };
}

export function completeOnboarding(
  state: OnboardingState,
): OnboardingState {
  return {
    ...state,
    completed: true,
    step: "finish",
  };
}

/**
 * Returns the onboarding state to keep when the user changes their target
 * career. This exists to make the invariant explicit and testable: changing a
 * career after onboarding must NOT reset onboarding completion or progress.
 */
export function preserveOnboardingOnRoleChange(
  state: OnboardingState,
): OnboardingState {
  return state;
}
