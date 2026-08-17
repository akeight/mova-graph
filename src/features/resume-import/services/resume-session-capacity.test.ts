import { describe, expect, it } from "vitest";

import { MAX_RESUME_TOTAL_TEXT_CHARS } from "../constants";

import { canAddResumeSourceText } from
  "./resume-session-capacity";

describe("canAddResumeSourceText", () => {
  it("accepts a session at the 60,000 character limit", () => {
    expect(
      canAddResumeSourceText(40_000, 20_000),
    ).toEqual({ ok: true });
  });

  it("rejects adding a source that would exceed 60,000 characters", () => {
    const result = canAddResumeSourceText(
      MAX_RESUME_TOTAL_TEXT_CHARS,
      1,
    );

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error).toContain("60,000");
    }
  });
});
