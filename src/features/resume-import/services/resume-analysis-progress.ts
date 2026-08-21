export const RESUME_ANALYSIS_STEPS = [
  {
    id: "reading",
    label: "Reading your resume",
    afterMs: 0,
  },
  {
    id: "finding",
    label: "Finding experiences",
    afterMs: 8_000,
  },
  {
    id: "mapping",
    label: "Mapping evidence",
    afterMs: 22_000,
  },
  {
    id: "preparing",
    label: "Preparing your draft profile",
    afterMs: 55_000,
  },
] as const;

export type ResumeAnalysisStepId =
  (typeof RESUME_ANALYSIS_STEPS)[number]["id"];

/**
 * Picks the in-progress analysis step from elapsed time. The last step stays
 * active until the extract request finishes, so the UI never claims the draft
 * is ready before it is.
 */
export function analysisStepIndexForElapsedMs(
  elapsedMs: number,
): number {
  const lastIndex = RESUME_ANALYSIS_STEPS.length - 1;
  let activeIndex = 0;

  for (const [index, step] of RESUME_ANALYSIS_STEPS.entries()) {
    if (elapsedMs >= step.afterMs) {
      activeIndex = Math.min(index, lastIndex);
    }
  }

  return activeIndex;
}

/**
 * Determinate bar that approaches ~90% while the model is still working, then
 * snaps to 100% when the request completes.
 */
export function analysisProgressPercent(
  elapsedMs: number,
  isComplete: boolean,
): number {
  if (isComplete) {
    return 100;
  }

  const cap = 90;
  const tauMs = 50_000;

  return Math.max(
    4,
    Math.min(
      cap,
      Math.round(cap * (1 - Math.exp(-elapsedMs / tauMs))),
    ),
  );
}
