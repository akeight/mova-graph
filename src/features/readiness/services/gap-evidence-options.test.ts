import { describe, expect, it } from "vitest";

import { getCareerRole } from "@/features/goals/data/career-roles";
import { createEmptyProfile } from
  "@/features/student-profile/utils/create-empty-profile";

import { calculateReadiness } from "./calculate-readiness";
import { getActionableGapEvidence } from "./gap-evidence-options";

describe("getActionableGapEvidence", () => {
  it("returns one representative for an OR evidence group", () => {
    const role = getCareerRole("product-engineer");
    const assessment = calculateReadiness(createEmptyProfile(), role);
    const softwareQuality = assessment.competencies.find(
      (competency) => competency.competencyId === "software-quality",
    );

    expect(softwareQuality).toBeDefined();

    const options = getActionableGapEvidence(softwareQuality!);

    expect(options).toHaveLength(1);
    expect(options[0]?.skillId).toBe("software-testing");
    expect(options[0]?.skillName).toBe("Software Testing");
    expect(options.map((option) => option.skillId)).not.toContain("testing");
    expect(options.map((option) => option.skillId)).not.toContain(
      "software-quality",
    );
  });

  it("omits demonstrated groups", () => {
    const role = getCareerRole("product-engineer");
    const assessment = calculateReadiness(
      {
        ...createEmptyProfile(),
        courses: [
          {
            id: "course-1",
            title: "Testing",
            status: "completed",
            skillIds: ["software-testing"],
          },
        ],
        skills: [
          {
            id: "software-testing",
            name: "Software Testing",
            status: "demonstrated",
          },
        ],
      },
      role,
    );
    const softwareQuality = assessment.competencies.find(
      (competency) => competency.competencyId === "software-quality",
    );

    expect(getActionableGapEvidence(softwareQuality!)).toEqual([]);
  });
});
