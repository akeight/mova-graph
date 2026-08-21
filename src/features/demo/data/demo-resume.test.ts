import { describe, expect, it } from "vitest";

import { studentProfileSchema } from
  "@/features/persistence/schemas/workspace";
import { applyResumeDraftToProfile } from
  "@/features/resume-import/services/apply-resume-draft-to-profile";
import { completeOnboarding, initialOnboarding } from
  "@/features/onboarding/services/onboarding-state";

import {
  DEMO_DEFAULT_CAREER_ROLE_ID,
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

function extractedDirects(itemId: string) {
  return itemById(itemId)
    .skills.filter((skill) => skill.provenance !== "derived")
    .map((skill) => ({
      id: skill.id,
      confidence: skill.confidence,
      selected: itemById(itemId).selectedSkillIds.includes(skill.id),
    }));
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
    expect(DEMO_RESUME_DRAFT.possibleDuplicates).toEqual([]);
    expect(DEMO_RESUME_TEXT).toContain("ALLYSON KEIGHTLEY");
    expect(DEMO_RESUME_TEXT).not.toMatch(/@/);
    expect(DEMO_RESUME_TEXT).not.toMatch(/linkedin\.com|github\.com|https?:\/\//i);
    expect(DEMO_DEFAULT_CAREER_ROLE_ID).toBe("full-stack-engineer");
  });

  it("has 14 expected items and nine named courses", () => {
    expect(DEMO_RESUME_DRAFT.items).toHaveLength(14);
    expect(DEMO_RESUME_DRAFT.items.map((item) => item.id)).toEqual([
      "demo-work-itron",
      "demo-work-todd",
      "demo-work-kahani",
      "demo-project-catalyst",
      "demo-project-classifier",
      "demo-course-python",
      "demo-course-dsa",
      "demo-course-frontend",
      "demo-course-statistics",
      "demo-course-data",
      "demo-course-leadership",
      "demo-course-ui",
      "demo-course-ux",
      "demo-course-version-control",
    ]);

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
    expect(extractedDirects("demo-course-python")).toEqual([
      { id: "python", confidence: 0.8, selected: false },
    ]);
    expect(extractedDirects("demo-course-dsa")).toEqual([]);
  });

  it("does not add React to Frontend Web Development and leaves it unselected", () => {
    expect(extractedDirects("demo-course-frontend")).toEqual([
      { id: "frontend-development", confidence: 0.75, selected: false },
    ]);
    expect(itemById("demo-course-frontend").selectedSkillIds).toEqual([]);
  });

  it("leaves UX evidence visible but unselected below the 0.85 gate", () => {
    expect(extractedDirects("demo-course-ui")).toEqual([
      { id: "user-experience", confidence: 0.7, selected: false },
    ]);
    expect(extractedDirects("demo-course-ux")).toEqual([
      { id: "user-experience", confidence: 0.75, selected: false },
    ]);
  });

  it("keeps representative Itron, Todd, Kahani, Catalyst, and classifier evidence", () => {
    expect(itemById("demo-work-itron").selectedSkillIds).toEqual([
      "dotnet-maui",
      "mobile-development",
      "csharp",
      "ios-development",
      "android-development",
      "unit-testing",
      "software-testing",
      "api-integration",
    ]);

    expect(extractedDirects("demo-work-todd")).toEqual(
      expect.arrayContaining([
        { id: "react", confidence: 0.95, selected: true },
        { id: "nextjs", confidence: 0.95, selected: true },
        { id: "performance", confidence: 0.8, selected: false },
      ]),
    );
    expect(itemById("demo-work-todd").selectedSkillIds).not.toContain(
      "performance",
    );

    expect(extractedDirects("demo-work-kahani")).toEqual(
      expect.arrayContaining([
        { id: "flutter", confidence: 0.95, selected: true },
        { id: "product-thinking", confidence: 0.8, selected: false },
      ]),
    );
    expect(itemById("demo-work-kahani").selectedSkillIds).not.toContain(
      "product-thinking",
    );

    expect(itemById("demo-project-catalyst").selectedSkillIds).toEqual([
      "nextjs",
      "typescript",
      "postgresql",
      "api-integration",
    ]);
    expect(itemById("demo-project-classifier").selectedSkillIds).toEqual([
      "python",
      "react",
      "frontend-development",
      "fastapi",
    ]);
  });

  it("keeps technical skills standalone without html-css", () => {
    expect(DEMO_RESUME_DRAFT.selectedStandaloneSkillIds).toEqual([
      "aws",
      "supabase",
      "nodejs",
      "express",
    ]);
    expect(DEMO_RESUME_DRAFT.standaloneSkills.map((skill) => skill.id)).not
      .toContain("html-css");

    const attached = DEMO_RESUME_DRAFT.items.flatMap((item) =>
      item.skills
        .filter((skill) => skill.provenance !== "derived")
        .map((skill) => skill.id),
    );

    expect(attached).not.toEqual(
      expect.arrayContaining(["aws", "supabase", "nodejs", "express"]),
    );
  });

  it("leaves all nine courses with empty selectedSkillIds", () => {
    expect(courseItems().every((item) => item.selectedSkillIds.length === 0))
      .toBe(true);
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
    expect(profile.skills.some((skill) => skill.id === "product-thinking")).toBe(
      false,
    );
    expect(profile.skills.some((skill) => skill.id === "performance")).toBe(
      false,
    );
    expect(profile.skills.some((skill) => skill.id === "html-css")).toBe(false);
  });

  it("uses completeOnboarding for the explore-existing-path seed", () => {
    expect(createExploredDemoOnboarding()).toEqual(
      completeOnboarding(initialOnboarding()),
    );
    expect(createExploredDemoProfile().name).toBe("Allyson Keightley");
  });
});
