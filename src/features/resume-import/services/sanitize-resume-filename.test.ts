import { describe, expect, it } from "vitest";

import { sanitizeResumeFilename } from
  "./sanitize-resume-filename";

describe("sanitizeResumeFilename", () => {
  it("keeps a simple resume filename", () => {
    expect(sanitizeResumeFilename("software-engineering.pdf")).toBe(
      "software-engineering.pdf",
    );
  });

  it("strips path components and control characters", () => {
    expect(
      sanitizeResumeFilename("..\\uploads/\u0000mobile.pdf"),
    ).toBe("mobile.pdf");
  });

  it("falls back when the name is empty", () => {
    expect(sanitizeResumeFilename("   ")).toBe("resume");
  });
});
