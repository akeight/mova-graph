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
  return {
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
    sourceIds: ["a"],
    ...overrides,
  };
}

describe("applyResumeDraftToProfile", () => {
  it("does not persist until this function runs, and validates the result", () => {
    const result = applyResumeDraftToProfile(
      emptyProfile(),
      {
        sources: [{ id: "a", displayName: "resume.pdf" }],
        applyProposedName: true,
        proposedName: "Jordan Lee",
        items: [draftItem()],
        standaloneSkills: [],
        possibleDuplicates: [],
      },
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
      {
        sources: [{ id: "a", displayName: "resume.pdf" }],
        applyProposedName: false,
        proposedName: "Jordan Lee",
        items: [draftItem()],
        standaloneSkills: [],
        possibleDuplicates: [],
      },
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
    const draft: ResumeImportDraft = {
      sources: [
        { id: "a", displayName: "a.pdf" },
        { id: "b", displayName: "b.pdf" },
      ],
      applyProposedName: false,
      items: [mergedItem],
      standaloneSkills: [],
      possibleDuplicates: [],
    };

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
      {
        sources: [{ id: "a", displayName: "resume.pdf" }],
        applyProposedName: false,
        items: [],
        standaloneSkills: [
          {
            id: "aws",
            name: "AWS",
            confidence: 0.9,
            evidence: "Skills: AWS",
            provenance: "direct",
          },
        ],
        possibleDuplicates: [],
      },
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
      {
        sources: [{ id: "a", displayName: "resume.pdf" }],
        applyProposedName: false,
        items: [
          draftItem({
            startDate: "May 2025",
            endDate: "August 2025",
          }),
        ],
        standaloneSkills: [],
        possibleDuplicates: [],
      },
      "onboarding",
    );

    expect(result.experiences[0]?.startDate).toBeUndefined();
    expect(result.experiences[0]?.endDate).toBeUndefined();
    expect(studentProfileSchema.safeParse(result).success).toBe(true);
  });

  it("persists constrained YYYY and YYYY-MM dates", () => {
    const result = applyResumeDraftToProfile(
      emptyProfile(),
      {
        sources: [{ id: "a", displayName: "resume.pdf" }],
        applyProposedName: false,
        items: [
          draftItem({
            startDate: "2025-05",
            endDate: "2025",
          }),
        ],
        standaloneSkills: [],
        possibleDuplicates: [],
      },
      "onboarding",
    );

    expect(result.experiences[0]?.startDate).toBe("2025-05");
    expect(result.experiences[0]?.endDate).toBe("2025");
  });

  it("fails the import instead of returning an unpersistable profile", () => {
    expect(() =>
      applyResumeDraftToProfile(
        emptyProfile(),
        {
          sources: [{ id: "a", displayName: "resume.pdf" }],
          applyProposedName: false,
          items: [draftItem({ title: "" })],
          standaloneSkills: [],
          possibleDuplicates: [],
        },
        "onboarding",
      ),
    ).toThrow(ResumeDraftApplyError);
  });
});
