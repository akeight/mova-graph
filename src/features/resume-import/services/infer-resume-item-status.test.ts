import { describe, expect, it } from "vitest";

import { inferResumeItemStatus } from
  "./infer-resume-item-status";

describe("inferResumeItemStatus", () => {
  it("treats an undated course as in-progress", () => {
    expect(
      inferResumeItemStatus({
        kind: "course",
        sourceExcerpt: "Data Structures. Covered trees and graphs.",
      }),
    ).toBe("in-progress");
  });

  it("treats an explicitly completed course as completed", () => {
    expect(
      inferResumeItemStatus({
        kind: "course",
        sourceExcerpt: "Completed Data Structures in 2024.",
      }),
    ).toBe("completed");
  });

  it("treats a current course as in-progress", () => {
    expect(
      inferResumeItemStatus({
        kind: "course",
        startDate: "2026-01",
        sourceExcerpt: "Software Testing (Current).",
      }),
    ).toBe("in-progress");
  });

  it("treats an issued certification as completed", () => {
    expect(
      inferResumeItemStatus({
        kind: "certification",
        sourceExcerpt: "AWS Cloud Practitioner issued May 2025.",
      }),
    ).toBe("completed");
  });

  it("treats an ambiguous certification as in-progress", () => {
    expect(
      inferResumeItemStatus({
        kind: "certification",
        sourceExcerpt: "AWS Cloud Practitioner",
      }),
    ).toBe("in-progress");
  });

  it("treats an ended internship as completed", () => {
    expect(
      inferResumeItemStatus({
        kind: "work",
        startDate: "2025-05",
        endDate: "2025-08",
        sourceExcerpt: "Software Engineering Intern, Acme, May 2025 – August 2025.",
      }),
    ).toBe("completed");
  });

  it("treats isCurrent as in-progress even when an end date exists", () => {
    expect(
      inferResumeItemStatus({
        kind: "work",
        startDate: "2026-05",
        endDate: "2026-08",
        isCurrent: true,
        sourceExcerpt: "Software Engineering Intern, Acme, May 2026 – August 2026.",
      }),
    ).toBe("in-progress");
  });
});
