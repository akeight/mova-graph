"use client";

import { Check, LoaderCircle } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

import {
  analysisProgressPercent,
  RESUME_ANALYSIS_STEPS,
} from "../services/resume-analysis-progress";

type ResumeAnalysisProgressProps = {
  sourceLabel: string;
  sourceIndex: number;
  sourceCount: number;
  stepIndex: number;
  elapsedMs: number;
};

export function ResumeAnalysisProgress({
  sourceLabel,
  sourceIndex,
  sourceCount,
  stepIndex,
  elapsedMs,
}: ResumeAnalysisProgressProps) {
  const percent = analysisProgressPercent(elapsedMs, false);
  const currentLabel =
    RESUME_ANALYSIS_STEPS[stepIndex]?.label ??
    RESUME_ANALYSIS_STEPS[0].label;

  return (
    <div
      className="space-y-5 rounded-2xl border bg-card p-6 shadow-sm"
      role="status"
      aria-live="polite"
      aria-label={currentLabel}
    >
      <div>
        <h2 className="text-lg font-semibold">
          Analyzing your resume
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This can take a minute or two. We&apos;ll work through
          each part of your resume instead of leaving you on
          a single spinner.
        </p>
        <p className="mt-2 text-xs font-medium text-muted-foreground">
          {sourceCount > 1
            ? `Resume ${sourceIndex + 1} of ${sourceCount} · ${sourceLabel}`
            : sourceLabel}
        </p>
      </div>

      <Progress value={percent} />

      <ol className="space-y-3">
        {RESUME_ANALYSIS_STEPS.map((step, index) => {
          const isComplete = index < stepIndex;
          const isActive = index === stepIndex;

          return (
            <li
              key={step.id}
              className="flex items-center gap-3"
              aria-current={isActive ? "step" : undefined}
            >
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border",
                  isComplete &&
                    "border-primary bg-primary text-primary-foreground",
                  isActive &&
                    "border-primary bg-primary/10 text-primary",
                  !isComplete &&
                    !isActive &&
                    "border-border text-muted-foreground",
                )}
              >
                {isComplete ? (
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                ) : isActive ? (
                  <LoaderCircle
                    className="h-3.5 w-3.5 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <span className="text-[11px] font-semibold">
                    {index + 1}
                  </span>
                )}
              </span>

              <span
                className={cn(
                  "text-sm",
                  isActive
                    ? "font-medium text-foreground"
                    : isComplete
                      ? "text-foreground"
                      : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
