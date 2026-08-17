"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

import type { OnboardingStep } from "../types/onboarding";

type OnboardingProgressStep = {
  step: OnboardingStep;
  label: string;
};

/** Steps shown in the indicator. `account` is pre-completed via auth. */
const PROGRESS_STEPS: OnboardingProgressStep[] = [
  { step: "build-profile", label: "Profile" },
  { step: "career-goal", label: "Career" },
  { step: "review-path", label: "Path" },
  { step: "finish", label: "Done" },
];

type OnboardingProgressProps = {
  currentStep: OnboardingStep;
};

export function OnboardingProgress({
  currentStep,
}: OnboardingProgressProps) {
  const currentIndex = Math.max(
    PROGRESS_STEPS.findIndex((item) => item.step === currentStep),
    0,
  );
  const totalSteps = PROGRESS_STEPS.length;
  const stepNumber = currentIndex + 1;

  return (
    <div className="w-full">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
        Step {stepNumber} of {totalSteps}
      </p>

      <ol className="mt-3 flex items-center gap-2">
        {PROGRESS_STEPS.map((item, index) => {
          const isComplete = index < currentIndex;
          const isActive = index === currentIndex;

          return (
            <li
              key={item.step}
              className="flex flex-1 flex-col gap-1.5"
              aria-current={isActive ? "step" : undefined}
            >
              <div
                className={cn(
                  "h-1.5 w-full rounded-full transition-colors",
                  isComplete || isActive
                    ? "bg-primary"
                    : "bg-primary/15",
                )}
              />

              <span
                className={cn(
                  "flex items-center gap-1 text-[11px] font-medium",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {isComplete ? (
                  <Check
                    className="h-3 w-3 text-primary"
                    aria-hidden="true"
                  />
                ) : null}
                {item.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
