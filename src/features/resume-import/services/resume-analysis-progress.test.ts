import { describe, expect, it } from "vitest";

import {
  analysisProgressPercent,
  analysisStepIndexForElapsedMs,
  RESUME_ANALYSIS_STEPS,
} from "./resume-analysis-progress";

describe("analysisStepIndexForElapsedMs", () => {
  it("starts on the first step", () => {
    expect(analysisStepIndexForElapsedMs(0)).toBe(0);
    expect(analysisStepIndexForElapsedMs(7_999)).toBe(0);
  });

  it("advances through later steps as time passes", () => {
    expect(analysisStepIndexForElapsedMs(8_000)).toBe(1);
    expect(analysisStepIndexForElapsedMs(22_000)).toBe(2);
    expect(analysisStepIndexForElapsedMs(55_000)).toBe(3);
  });

  it("never advances past the last step", () => {
    expect(analysisStepIndexForElapsedMs(10 * 60_000)).toBe(
      RESUME_ANALYSIS_STEPS.length - 1,
    );
  });
});

describe("analysisProgressPercent", () => {
  it("is complete only when the request has finished", () => {
    expect(analysisProgressPercent(120_000, false)).toBeLessThan(100);
    expect(analysisProgressPercent(1_000, true)).toBe(100);
  });

  it("starts with visible progress and grows over time", () => {
    const early = analysisProgressPercent(1_000, false);
    const later = analysisProgressPercent(50_000, false);

    expect(early).toBeGreaterThan(0);
    expect(later).toBeGreaterThan(early);
  });
});
