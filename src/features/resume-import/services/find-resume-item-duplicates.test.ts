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

  it("does not treat Software Engineer as an exact match for Senior Software Engineer", () => {
    const matches = findResumeItemDuplicates(
      [
        {
          id: "a",
          kind: "work",
          title: "Software Engineer",
          organization: "Acme",
          startDate: "2024-01",
          endDate: "2025-12",
        },
      ],
      [
        {
          id: "b",
          kind: "work",
          title: "Senior Software Engineer",
          organization: "Acme",
          startDate: "2024-06",
          endDate: "2025-06",
        },
      ],
    );

    expect(matches).toHaveLength(1);
    expect(matches[0]?.confidence).toBe("probable");
  });

  it("does not treat Data Structures as an exact match for Advanced Data Structures", () => {
    const matches = findResumeItemDuplicates(
      [
        {
          id: "a",
          kind: "course",
          title: "Data Structures",
        },
      ],
      [
        {
          id: "b",
          kind: "course",
          title: "Advanced Data Structures",
        },
      ],
    );

    expect(matches).toHaveLength(1);
    expect(matches[0]?.confidence).toBe("probable");
  });

  it("treats the same normalized title at the same organization as exact", () => {
    const matches = findResumeItemDuplicates(
      [
        {
          id: "a",
          kind: "work",
          title: "Software Engineer",
          organization: "Acme Inc.",
          startDate: "2024-01",
        },
      ],
      [
        {
          id: "b",
          kind: "work",
          title: "software engineer",
          organization: "Acme",
          startDate: "2024-03",
        },
      ],
    );

    expect(matches).toHaveLength(1);
    expect(matches[0]?.confidence).toBe("exact");
  });
});
