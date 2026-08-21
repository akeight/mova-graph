import { describe, expect, it } from "vitest";

import { studentProfileSchema } from
  "@/features/persistence/schemas/workspace";
import { applyResumeDraftToProfile } from
  "@/features/resume-import/services/apply-resume-draft-to-profile";
import { completeOnboarding, initialOnboarding } from
  "@/features/onboarding/services/onboarding-state";

import {
  DEMO_RESUME_DISPLAY_NAME,
  DEMO_RESUME_DRAFT,
  DEMO_RESUME_SOURCE_ID,
  DEMO_RESUME_TEXT,
  createDemoBaselineProfile,
  createExploredDemoOnboarding,
  createExploredDemoProfile,
} from "./demo-resume";

function courseItems() {
  return DEMO_RESUME_DRAFT.items.filter((item) => item.kind === "course");
}

function itemById(id: string) {
  const item = DEMO_RESUME_DRAFT.items.find((entry) => entry.id === id);

  if (!item) {
    throw new Error(`Missing demo draft item ${id}`);
  }

  return item;
}

function directIds(itemId: string): string[] {
  return itemById(itemId)
    .skills.filter((skill) => skill.provenance !== "derived")
    .map((skill) => skill.id);
}

describe("DEMO_RESUME_DRAFT", () => {
  it("uses the real ResumeImportDraft shape and sanitized metadata", () => {
    expect(DEMO_RESUME_DRAFT.sources).toEqual([
      {
        id: DEMO_RESUME_SOURCE_ID,
        displayName: DEMO_RESUME_DISPLAY_NAME,
      },
    ]);
    expect(DEMO_RESUME_DRAFT.proposedName).toBe("Allyson Keightley");
    expect(DEMO_RESUME_DRAFT.program).toBe(
      "Bachelor of Science in Software Engineering",
    );
    expect(DEMO_RESUME_DRAFT.institution).toBe(
      "Western Governors University",
    );
    expect(DEMO_RESUME_DRAFT.applyProposedName).toBe(true);
    expect(DEMO_RESUME_DRAFT.possibleDuplicates).toEqual([]);
    expect(DEMO_RESUME_TEXT).toContain("ALLYSON KEIGHTLEY");
    expect(DEMO_RESUME_TEXT).not.toMatch(/@/);
    expect(DEMO_RESUME_TEXT).not.toMatch(/linkedin\.com|github\.com|https?:\/\//i);
  });

  it("splits relevant coursework into nine named courses", () => {
    const courses = courseItems();

    expect(courses).toHaveLength(9);
    expect(courses.map((item) => item.title)).not.toEqual(
      expect.arrayContaining([
        "Relevant Coursework",
        "Coursework",
        "Selected Coursework",
        "Courses",
      ]),
    );
  });

  it("keeps Python on the Python course and off DSA", () => {
    expect(directIds("demo-course-python")).toContain("python");
    expect(directIds("demo-course-dsa")).not.toContain("python");
  });

  it("does not add React to Frontend Web Development", () => {
    expect(directIds("demo-course-frontend")).toEqual(["frontend-development"]);
    expect(directIds("demo-course-frontend")).not.toContain("react");
  });

  it("keeps Itron directs without derived mobile/testing roots", () => {
    expect(directIds("demo-work-itron")).toEqual([
      "dotnet-maui",
      "csharp",
      "ios-development",
      "android-development",
      "unit-testing",
      "api-integration",
    ]);
    expect(directIds("demo-work-itron")).not.toContain("mobile-development");
    expect(directIds("demo-work-itron")).not.toContain("software-testing");
    expect(itemById("demo-work-itron").skills.map((skill) => skill.id)).toEqual(
      expect.arrayContaining(["mobile-development", "software-testing"]),
    );
  });

  it("keeps Todd, Kahani, Catalyst, and classifier directs", () => {
    expect(directIds("demo-work-todd")).toEqual([
      "react",
      "nextjs",
      "performance",
    ]);
    expect(directIds("demo-work-kahani")).toEqual([
      "flutter",
      "ios-development",
      "android-development",
      "react",
      "product-thinking",
    ]);
    expect(directIds("demo-work-kahani")).not.toContain("swift");
    expect(directIds("demo-work-kahani")).not.toContain("kotlin");
    expect(directIds("demo-project-catalyst")).toEqual([
      "nextjs",
      "typescript",
      "postgresql",
      "api-integration",
    ]);
    expect(directIds("demo-project-classifier")).toEqual([
      "python",
      "react",
      "fastapi",
    ]);
  });

  it("keeps technical skills standalone", () => {
    expect(DEMO_RESUME_DRAFT.selectedStandaloneSkillIds).toEqual([
      "aws",
      "supabase",
      "nodejs",
      "express",
      "html-css",
    ]);

    const attached = DEMO_RESUME_DRAFT.items.flatMap((item) =>
      item.skills
        .filter((skill) => skill.provenance !== "derived")
        .map((skill) => skill.id),
    );

    expect(attached).not.toEqual(
      expect.arrayContaining([
        "aws",
        "supabase",
        "nodejs",
        "express",
        "html-css",
      ]),
    );
  });
});

describe("demo profile apply", () => {
  it("produces a schema-valid profile from the real apply function", () => {
    const profile = applyResumeDraftToProfile(
      createDemoBaselineProfile(),
      DEMO_RESUME_DRAFT,
      "onboarding",
    );
    const parsed = studentProfileSchema.safeParse(profile);

    expect(parsed.success).toBe(true);
    expect(profile.name).toBe("Allyson Keightley");
    expect(profile.courses).toHaveLength(9);
    expect(profile.skills.some((skill) => skill.id === "mobile-development")).toBe(
      true,
    );
    expect(
      profile.experiences.some((item) =>
        item.skillIds.includes("aws"),
      ),
    ).toBe(false);
    expect(profile.skills.find((skill) => skill.id === "aws")?.selfReported).toBe(
      true,
    );
  });

  it("uses completeOnboarding for the explore-existing-path seed", () => {
    expect(createExploredDemoOnboarding()).toEqual(
      completeOnboarding(initialOnboarding()),
    );
    expect(createExploredDemoProfile().name).toBe("Allyson Keightley");
  });
});
