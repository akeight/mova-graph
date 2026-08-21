import { describe, expect, it } from "vitest";

import { DEMO_RESUME_DRAFT } from "../data/demo-resume";
import { parsePublicDemoResumeDraft } from
  "./parse-public-demo-resume-draft";

import { isAcceptablePublicDemoResumeDraft } from
  "./demo-live-resume-guard";

describe("isAcceptablePublicDemoResumeDraft", () => {
  it("accepts the saved demo fixture", () => {
    const draft = parsePublicDemoResumeDraft(DEMO_RESUME_DRAFT);

    expect(draft).not.toBeNull();
    expect(isAcceptablePublicDemoResumeDraft(draft!)).toBe(true);
  });

  it("rejects a draft with no useful items", () => {
    expect(
      isAcceptablePublicDemoResumeDraft({
        ...DEMO_RESUME_DRAFT,
        items: [],
      }),
    ).toBe(false);
  });

  it("rejects a generic coursework heading item", () => {
    expect(
      isAcceptablePublicDemoResumeDraft({
        ...DEMO_RESUME_DRAFT,
        items: [
          {
            ...DEMO_RESUME_DRAFT.items[0],
            id: "generic-coursework",
            title: "Relevant Coursework",
          },
        ],
      }),
    ).toBe(false);
  });

  it("rejects Python leaked onto Data Structures and Algorithms", () => {
    const dsa = DEMO_RESUME_DRAFT.items.find(
      (item) => item.title === "Data Structures and Algorithms",
    );

    expect(dsa).toBeDefined();
    expect(
      isAcceptablePublicDemoResumeDraft({
        ...DEMO_RESUME_DRAFT,
        items: DEMO_RESUME_DRAFT.items.map((item) =>
          item.title === "Data Structures and Algorithms"
            ? {
                ...item,
                skills: [
                  {
                    id: "python",
                    name: "Python",
                    confidence: 1,
                    evidence: "Neighboring Programming in Python course",
                    provenance: "direct",
                  },
                  ...item.skills,
                ],
              }
            : item,
        ),
      }),
    ).toBe(false);
  });

  it("rejects React leaked onto Frontend Web Development", () => {
    expect(
      isAcceptablePublicDemoResumeDraft({
        ...DEMO_RESUME_DRAFT,
        items: DEMO_RESUME_DRAFT.items.map((item) =>
          item.title === "Frontend Web Development"
            ? {
                ...item,
                skills: [
                  {
                    id: "react",
                    name: "React",
                    confidence: 1,
                    evidence: "Inferred from Frontend Web Development",
                    provenance: "direct",
                  },
                  ...item.skills,
                ],
              }
            : item,
        ),
      }),
    ).toBe(false);
  });

  it("allows Python on Programming in Python", () => {
    const pythonCourse = DEMO_RESUME_DRAFT.items.find(
      (item) => item.title === "Programming in Python",
    );

    expect(pythonCourse?.skills.some((skill) => skill.id === "python")).toBe(
      true,
    );
    expect(isAcceptablePublicDemoResumeDraft(DEMO_RESUME_DRAFT)).toBe(true);
  });
});
