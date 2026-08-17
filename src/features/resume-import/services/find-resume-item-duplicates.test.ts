import { describe, expect, it } from "vitest";

import { findResumeItemDuplicates } from
  "./find-resume-item-duplicates";

describe("findResumeItemDuplicates", () => {
  it("does not treat missing endDate as a closed date equal to startDate", () => {
    const matches = findResumeItemDuplicates(
      [
        {
          id: "a",
          kind: "work",
          title: "Software Engineering Intern",
          organization: "Acme",
          startDate: "2026-05",
        },
      ],
      [
        {
          id: "b",
          kind: "work",
          title: "Software Engineering Intern",
          organization: "Acme",
          startDate: "2026-06",
        },
      ],
    );

    expect(matches).toHaveLength(1);
    expect(matches[0]?.confidence).toBe("exact");
  });

  it("still keeps non-overlapping closed terms separate", () => {
    const matches = findResumeItemDuplicates(
      [
        {
          id: "a",
          kind: "work",
          title: "Software Engineering Intern",
          organization: "Acme",
          startDate: "2025-05",
          endDate: "2025-08",
        },
      ],
      [
        {
          id: "b",
          kind: "work",
          title: "Software Engineering Intern",
          organization: "Acme",
          startDate: "2026-05",
          endDate: "2026-08",
        },
      ],
    );

    expect(matches).toEqual([]);
  });
});
