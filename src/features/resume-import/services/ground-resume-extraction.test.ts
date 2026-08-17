import { describe, expect, it } from "vitest";

import { SOURCE_EXCERPT_MAX_CHARS } from "../constants";

import { isItemExcerptAcceptable } from "./ground-resume-extraction";

describe("isItemExcerptAcceptable", () => {
  it("always rejects an exact whole-resume activity excerpt", () => {
    const resume = [
      "Software Engineering Intern — Acme",
      "Built internal tooling for the platform team.",
      "B.S. Computer Science, State University",
      "Skills: AWS",
    ].join("\n");

    expect(resume.length).toBeLessThanOrEqual(SOURCE_EXCERPT_MAX_CHARS);
    expect(isItemExcerptAcceptable(resume, resume)).toBe(false);
  });

  it("rejects an oversized excerpt on a short resume under the max excerpt cap", () => {
    const activity = "Software Engineering Intern — Acme\nBuilt internal tooling.";
    const resume = `${activity}\nEducation and extra context.`;
    const excerpt = resume.slice(0, Math.ceil(resume.length * 0.7));

    expect(resume.length).toBeLessThanOrEqual(SOURCE_EXCERPT_MAX_CHARS);
    expect(excerpt.length).toBeGreaterThan(resume.length * 0.4);
    expect(isItemExcerptAcceptable(excerpt, resume)).toBe(false);
  });

  it("accepts an activity-sized block copied from a longer resume", () => {
    const excerpt = [
      "Software Engineering Intern — Acme",
      "Built internal tooling for the platform team.",
    ].join("\n");
    const resume = [
      "Jordan Lee",
      "B.S. Computer Science, State University, 2022-2026",
      "Coursework: Data Structures, Algorithms, Operating Systems, Databases",
      excerpt,
      "Volunteer tutor for introductory programming workshops.",
      "Skills: AWS, Docker, TypeScript",
    ].join("\n");

    expect(excerpt.length).toBeLessThanOrEqual(resume.length * 0.4);
    expect(isItemExcerptAcceptable(excerpt, resume)).toBe(true);
  });
});
