import { describe, expect, it } from "vitest";

import { studentProfileSchema } from
  "@/features/persistence/schemas/workspace";
import { PROFILE_ITEM_DESCRIPTION_MAX } from
  "@/features/student-profile/constants";
import type { StudentProfile } from
  "@/features/student-profile/types/student-profile";

import type { ResumeDraftItem, ResumeImportDraft } from
  "../types/resume-import";

import {
  applyResumeDraftToProfile,
  ResumeDraftApplyError,
} from "./apply-resume-draft-to-profile";
import { mergeResumeDraftItems } from
  "./merge-resume-draft-items";
import { addManualSkillToDraftItem } from
  "./resume-draft-skills";

function emptyProfile(
  overrides: Partial<StudentProfile> = {},
): StudentProfile {
  return {
    id: "student-1",
    name: "jordan",
    courses: [],
    experiences: [],
    skills: [],
    ...overrides,
  };
}

function draftItem(
  overrides: Partial<ResumeDraftItem> = {},
): ResumeDraftItem {
  const item: ResumeDraftItem = {
    id: "draft-1",
    kind: "work",
    title: "Software Engineering Intern",
    organization: "Acme",
    description: "Built a Next.js dashboard using TypeScript.",
    status: "completed",
    skills: [
      {
        id: "nextjs",
        name: "Next.js",
        confidence: 0.9,
        evidence: "Built a Next.js dashboard",
        provenance: "direct",
      },
    ],
    selectedSkillIds: [],
    sourceIds: ["a"],
    ...overrides,
  };

  if (overrides.selectedSkillIds === undefined) {
    item.selectedSkillIds = item.skills
      .filter(
        (skill) =>
          skill.provenance !== "derived" &&
          skill.normalizationMethod !== "unmapped" &&
          skill.confidence >= 0.85,
      )
      .map((skill) => skill.id);
  }

  return item;
}

function emptyDraft(
  overrides: Partial<ResumeImportDraft> = {},
): ResumeImportDraft {
  return {
    sources: [{ id: "a", displayName: "resume.pdf" }],
    applyProposedName: false,
    items: [],
    standaloneSkills: [],
    selectedStandaloneSkillIds: [],
    possibleDuplicates: [],
    ...overrides,
  };
}

describe("applyResumeDraftToProfile", () => {
  it("does not persist until this function runs, and validates the result", () => {
    const result = applyResumeDraftToProfile(
      emptyProfile(),
      emptyDraft({
        applyProposedName: true,
        proposedName: "Jordan Lee",
        items: [draftItem()],
      }),
      "onboarding",
    );

    expect(result.name).toBe("Jordan Lee");
    expect(result.experiences).toHaveLength(1);
    expect(studentProfileSchema.parse(result).experiences[0]?.title).toBe(
      "Software Engineering Intern",
    );
  });

  it("does not replace an existing name on later import unless opted in", () => {
    const result = applyResumeDraftToProfile(
      emptyProfile({ name: "jordan" }),
      emptyDraft({
        proposedName: "Jordan Lee",
        items: [draftItem()],
      }),
      "later",
    );

    expect(result.name).toBe("jordan");
  });

  it("keeps a merged description within the persisted limit", () => {
    const left = draftItem({
      description: "A".repeat(PROFILE_ITEM_DESCRIPTION_MAX),
    });
    const right = draftItem({
      id: "draft-2",
      description: "B".repeat(PROFILE_ITEM_DESCRIPTION_MAX),
      skills: [
        {
          id: "react",
          name: "React",
          confidence: 0.9,
          evidence: "React",
          provenance: "direct",
        },
      ],
    });
    const mergedItem = mergeResumeDraftItems(left, right);
    const draft: ResumeImportDraft = emptyDraft({
      sources: [
        { id: "a", displayName: "a.pdf" },
        { id: "b", displayName: "b.pdf" },
      ],
      items: [mergedItem],
    });

    const result = applyResumeDraftToProfile(emptyProfile(), draft, "onboarding");

    expect(result.experiences[0]?.description?.length).toBeLessThanOrEqual(
      PROFILE_ITEM_DESCRIPTION_MAX,
    );
    expect(result.experiences[0]?.skillIds).toEqual(
      expect.arrayContaining(["nextjs", "react"]),
    );
    expect(studentProfileSchema.safeParse(result).success).toBe(true);
  });

  it("adds standalone skills as self-reported developing roots", () => {
    const result = applyResumeDraftToProfile(
      emptyProfile(),
      emptyDraft({
        standaloneSkills: [
          {
            id: "aws",
            name: "AWS",
            confidence: 0.9,
            evidence: "Skills: AWS",
            provenance: "direct",
          },
        ],
        selectedStandaloneSkillIds: ["aws"],
      }),
      "onboarding",
    );

    const aws = result.skills.find((skill) => skill.id === "aws");
    const cloud = result.skills.find((skill) => skill.id === "cloud-platform");

    expect(aws).toMatchObject({
      status: "developing",
      selfReported: true,
    });
    expect(cloud?.status).toBe("developing");
    expect(cloud?.selfReported).toBeUndefined();
  });

  it("does not persist arbitrary experience dates", () => {
    const result = applyResumeDraftToProfile(
      emptyProfile(),
      emptyDraft({
        items: [
          draftItem({
            startDate: "May 2025",
            endDate: "August 2025",
          }),
        ],
      }),
      "onboarding",
    );

    expect(result.experiences[0]?.startDate).toBeUndefined();
    expect(result.experiences[0]?.endDate).toBeUndefined();
    expect(studentProfileSchema.safeParse(result).success).toBe(true);
  });

  it("persists constrained YYYY and YYYY-MM dates", () => {
    const result = applyResumeDraftToProfile(
      emptyProfile(),
      emptyDraft({
        items: [
          draftItem({
            startDate: "2025-05",
            endDate: "2025",
          }),
        ],
      }),
      "onboarding",
    );

    expect(result.experiences[0]?.startDate).toBe("2025-05");
    expect(result.experiences[0]?.endDate).toBe("2025");
  });

  it("fails the import instead of returning an unpersistable profile", () => {
    expect(() =>
      applyResumeDraftToProfile(
        emptyProfile(),
        emptyDraft({
          items: [draftItem({ title: "" })],
        }),
        "onboarding",
      ),
    ).toThrow(ResumeDraftApplyError);
  });

  it("persists a 0.92 mapping selected by default, including implications", () => {
    const result = applyResumeDraftToProfile(
      emptyProfile(),
      emptyDraft({
        items: [
          draftItem({
            skills: [
              {
                id: "nextjs",
                name: "Next.js",
                confidence: 0.92,
                evidence: "Built a Next.js dashboard",
                provenance: "direct",
              },
            ],
          }),
        ],
      }),
      "onboarding",
    );

    expect(result.experiences[0]?.skillIds).toEqual(
      expect.arrayContaining(["nextjs", "react"]),
    );
  });

  it("persists manually added React independently of unselected Next.js", () => {
    const extracted = draftItem({
      skills: [
        {
          id: "nextjs",
          name: "Next.js",
          confidence: 0.95,
          evidence: "Built a Next.js dashboard",
          provenance: "direct",
        },
        {
          id: "react",
          name: "React",
          confidence: 0.99,
          evidence: "Implied by Next.js",
          provenance: "derived",
          derivedFromSkillId: "nextjs",
        },
      ],
      selectedSkillIds: ["nextjs"],
    });
    const withManualReact = addManualSkillToDraftItem(extracted, "React");
    const reactOnly = {
      ...withManualReact,
      selectedSkillIds: ["react"],
    };

    const result = applyResumeDraftToProfile(
      emptyProfile(),
      emptyDraft({ items: [reactOnly] }),
      "onboarding",
    );

    expect(
      withManualReact.skills.find((skill) => skill.id === "react")?.provenance,
    ).toBe("direct");
    expect(result.experiences[0]?.skillIds).toContain("react");
    expect(result.experiences[0]?.skillIds).not.toContain("nextjs");
  });

  it("does not persist a 0.70 mapping unless the user selects it", () => {
    const unselected = applyResumeDraftToProfile(
      emptyProfile(),
      emptyDraft({
        items: [
          draftItem({
            skills: [
              {
                id: "react",
                name: "React",
                confidence: 0.7,
                evidence: "Built a React dashboard",
                provenance: "direct",
              },
            ],
            selectedSkillIds: [],
          }),
        ],
      }),
      "onboarding",
    );

    expect(unselected.experiences[0]?.skillIds).not.toContain("react");

    const selected = applyResumeDraftToProfile(
      emptyProfile(),
      emptyDraft({
        items: [
          draftItem({
            skills: [
              {
                id: "react",
                name: "React",
                confidence: 0.7,
                evidence: "Built a React dashboard",
                provenance: "direct",
              },
            ],
            selectedSkillIds: ["react"],
          }),
        ],
      }),
      "onboarding",
    );

    expect(selected.experiences[0]?.skillIds).toContain("react");
  });

  it("does not persist unmapped evidence unless the user selects it", () => {
    const result = applyResumeDraftToProfile(
      emptyProfile(),
      emptyDraft({
        items: [
          draftItem({
            skills: [
              {
                id: "atlasflow",
                name: "AtlasFlow",
                confidence: 0,
                evidence: "Used AtlasFlow",
                provenance: "direct",
                normalizationMethod: "unmapped",
              },
            ],
            selectedSkillIds: [],
          }),
        ],
      }),
      "onboarding",
    );

    expect(result.experiences[0]?.skillIds).not.toContain("atlasflow");
  });

  it("does not persist derived evidence from an independent selection", () => {
    const result = applyResumeDraftToProfile(
      emptyProfile(),
      emptyDraft({
        items: [
          draftItem({
            skills: [
              {
                id: "react",
                name: "React",
                confidence: 0.99,
                evidence: "Derived from Next.js",
                provenance: "derived",
                derivedFromSkillId: "nextjs",
              },
            ],
            selectedSkillIds: ["react"],
          }),
        ],
      }),
      "onboarding",
    );

    expect(result.experiences[0]?.skillIds).not.toContain("react");
  });

  it("persists manually added Python on an empty course before approval", () => {
    const emptyCourse = draftItem({
      kind: "course",
      title: "Programming in Python",
      organization: undefined,
      description: undefined,
      status: "in-progress",
      skills: [],
      selectedSkillIds: [],
    });
    const withPython = addManualSkillToDraftItem(emptyCourse, "Python");
    const python = withPython.skills.find((skill) => skill.id === "python");

    expect(python).toMatchObject({
      id: "python",
      name: "Python",
      provenance: "direct",
    });
    expect(withPython.selectedSkillIds).toContain("python");

    const result = applyResumeDraftToProfile(
      emptyProfile(),
      emptyDraft({ items: [withPython] }),
      "onboarding",
    );
    const course = result.courses.find(
      (entry) => entry.title === "Programming in Python",
    );

    expect(course?.skillIds).toContain("python");
  });

  it("does not persist unselected standalone skills as self-reported roots", () => {
    const result = applyResumeDraftToProfile(
      emptyProfile(),
      emptyDraft({
        standaloneSkills: [
          {
            id: "aws",
            name: "AWS",
            confidence: 0.7,
            evidence: "Skills: AWS",
            provenance: "direct",
          },
        ],
        selectedStandaloneSkillIds: [],
      }),
      "onboarding",
    );

    expect(result.skills.find((skill) => skill.id === "aws")).toBeUndefined();
  });
});
