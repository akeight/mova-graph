import { describe, expect, it } from "vitest";

import { getCareerRole } from "@/features/goals/data/career-roles";
import type { CompetencyReadiness } from "@/features/readiness/types/readiness";
import type { StudentProfile } from
  "@/features/student-profile/types/student-profile";

import {
  buildOpportunityResult,
  diffCompetencyImpacts,
  formatOpportunityImpactCopy,
  resolveZeroDeltaReason,
  selectRemainingGaps,
} from "./build-opportunity-result";

const role = getCareerRole("product-engineer");

const emptyProfile: StudentProfile = {
  id: "student",
  name: "Student",
  courses: [],
  experiences: [],
  skills: [],
};

function competency(
  value: Pick<
    CompetencyReadiness,
    "competencyId" | "competencyName" | "tier" | "competencyCredit"
  > &
    Partial<CompetencyReadiness>,
): CompetencyReadiness {
  return {
    description: "",
    evidenceStatus: "missing",
    displayStatus: value.tier === "specialized" ? "not-explored" : "missing",
    groups: [],
    matchedEvidence: [],
    ...value,
  };
}

describe("diffCompetencyImpacts", () => {
  it("keeps only competencies whose credit increased", () => {
    const impacts = diffCompetencyImpacts(
      [
        competency({
          competencyId: "software-quality",
          competencyName: "Software Quality",
          tier: "common",
          competencyCredit: 0.5,
          evidenceStatus: "developing",
          displayStatus: "developing",
        }),
        competency({
          competencyId: "product-judgment",
          competencyName: "Product Judgment",
          tier: "core",
          competencyCredit: 0,
        }),
      ],
      [
        competency({
          competencyId: "software-quality",
          competencyName: "Software Quality",
          tier: "common",
          competencyCredit: 1,
          evidenceStatus: "demonstrated",
          displayStatus: "demonstrated",
        }),
        competency({
          competencyId: "product-judgment",
          competencyName: "Product Judgment",
          tier: "core",
          competencyCredit: 0,
        }),
      ],
    );

    expect(impacts).toEqual([
      {
        competencyId: "software-quality",
        competencyName: "Software Quality",
        tier: "common",
        creditBefore: 0.5,
        creditAfter: 1,
      },
    ]);
  });
});

describe("selectRemainingGaps", () => {
  it("returns at most four Core then Common gaps by lowest credit then name", () => {
    const gaps = selectRemainingGaps([
      competency({
        competencyId: "ux-design-fluency",
        competencyName: "UX / Design Fluency",
        tier: "common",
        competencyCredit: 0,
      }),
      competency({
        competencyId: "software-quality",
        competencyName: "Software Quality",
        tier: "common",
        competencyCredit: 0,
      }),
      competency({
        competencyId: "product-judgment",
        competencyName: "Product Judgment",
        tier: "core",
        competencyCredit: 0.5,
        evidenceStatus: "developing",
        displayStatus: "developing",
      }),
      competency({
        competencyId: "user-facing-engineering",
        competencyName: "User-Facing Engineering",
        tier: "core",
        competencyCredit: 0,
      }),
      competency({
        competencyId: "end-to-end-ownership",
        competencyName: "End-to-End Ownership / Delivery",
        tier: "core",
        competencyCredit: 0,
      }),
      competency({
        competencyId: "design-systems",
        competencyName: "Design Systems",
        tier: "specialized",
        competencyCredit: 0,
        displayStatus: "not-explored",
      }),
    ]);

    expect(gaps.map((gap) => gap.competencyId)).toEqual([
      "end-to-end-ownership",
      "user-facing-engineering",
      "product-judgment",
      "software-quality",
    ]);
  });
});

describe("resolveZeroDeltaReason", () => {
  it("classifies scored progress that does not move the rounded score", () => {
    expect(
      resolveZeroDeltaReason({
        scoreBefore: 67,
        scoreAfter: 67,
        impacts: [
          {
            competencyId: "software-quality",
            competencyName: "Software Quality",
            tier: "common",
            creditBefore: 0.5,
            creditAfter: 0.67,
          },
        ],
        profile: emptyProfile,
        skillIds: ["software-testing"],
      }),
    ).toBe("scored-progress-no-rounded-delta");
  });

  it("does not call scored-progress specialized-only or already-demonstrated", () => {
    const reason = resolveZeroDeltaReason({
      scoreBefore: 67,
      scoreAfter: 67,
      impacts: [
        {
          competencyId: "software-quality",
          competencyName: "Software Quality",
          tier: "common",
          creditBefore: 0.5,
          creditAfter: 0.67,
        },
        {
          competencyId: "design-systems",
          competencyName: "Design Systems",
          tier: "specialized",
          creditBefore: 0,
          creditAfter: 1,
        },
      ],
      profile: {
        ...emptyProfile,
        skills: [
          {
            id: "software-testing",
            name: "Software Testing",
            status: "demonstrated",
          },
        ],
      },
      skillIds: ["software-testing"],
    });

    expect(reason).toBe("scored-progress-no-rounded-delta");
    expect(reason).not.toBe("specialized-only");
    expect(reason).not.toBe("already-demonstrated");
  });

  it("classifies specialized-only progress", () => {
    expect(
      resolveZeroDeltaReason({
        scoreBefore: 61,
        scoreAfter: 61,
        impacts: [
          {
            competencyId: "design-systems",
            competencyName: "Design Systems",
            tier: "specialized",
            creditBefore: 0,
            creditAfter: 1,
          },
        ],
        profile: emptyProfile,
        skillIds: ["design-systems"],
      }),
    ).toBe("specialized-only");
  });

  it("classifies already demonstrated catalog evidence", () => {
    expect(
      resolveZeroDeltaReason({
        scoreBefore: 76,
        scoreAfter: 76,
        impacts: [],
        profile: {
          ...emptyProfile,
          courses: [
            {
              id: "react-course",
              title: "React",
              status: "completed",
              skillIds: ["react"],
            },
          ],
          skills: [
            { id: "react", name: "React", status: "demonstrated" },
          ],
        },
        skillIds: ["react"],
      }),
    ).toBe("already-demonstrated");
  });
});

describe("formatOpportunityImpactCopy", () => {
  it("explains scored progress with a zero rounded delta", () => {
    expect(
      formatOpportunityImpactCopy({
        opportunityType: "internship",
        roleTitle: "Product Engineer",
        addedEvidenceNames: ["Software Testing"],
        strengthenedCompetencyNames: ["Software Quality"],
        zeroDeltaReason: "scored-progress-no-rounded-delta",
      }),
    ).toBe(
      "This would strengthen some of your career competencies, but the improvement isn't large enough to change your rounded overall readiness score yet.",
    );
  });

  it("builds a deterministic why-this-helps sentence", () => {
    expect(
      formatOpportunityImpactCopy({
        opportunityType: "internship",
        roleTitle: "Product Engineer",
        addedEvidenceNames: ["React", "API Integration"],
        strengthenedCompetencyNames: [
          "User-Facing Engineering",
          "Application Data & APIs",
        ],
        zeroDeltaReason: null,
      }),
    ).toBe(
      "If completed, this internship adds evidence in React, API Integration, which strengthen User-Facing Engineering, Application Data & APIs in your Product Engineer model.",
    );
  });
});

describe("buildOpportunityResult", () => {
  it("projects internships against the current role without mutating the profile", () => {
    const original = structuredClone(emptyProfile);
    const result = buildOpportunityResult({
      opportunityType: "internship",
      title: "Software Engineering Intern",
      description: "Build React interfaces.",
      profile: emptyProfile,
      role,
      skillIds: ["react", "frontend-development"],
    });

    expect(emptyProfile).toEqual(original);
    expect(result.scoreAfter).toBeGreaterThan(result.scoreBefore);
    expect(
      result.strengthenedCompetencies.some(
        (impact) => impact.competencyId === "user-facing-engineering",
      ),
    ).toBe(true);
    expect(result.remainingGaps.length).toBeLessThanOrEqual(4);
    expect(result.explanation.zeroDeltaReason).toBeNull();
    expect(result.projectedProfile.experiences[0]?.status).toBe("completed");
  });

  it("recalculates when the target role changes", () => {
    const skillIds = ["react", "frontend-development", "api-integration"];
    const product = buildOpportunityResult({
      opportunityType: "project",
      title: "Dashboard",
      description: "Build a React dashboard.",
      profile: emptyProfile,
      role,
      skillIds,
    });
    const mobile = buildOpportunityResult({
      opportunityType: "project",
      title: "Dashboard",
      description: "Build a React dashboard.",
      profile: emptyProfile,
      role: getCareerRole("mobile-engineer"),
      skillIds,
    });

    expect(product.scoreAfter).not.toBe(mobile.scoreAfter);
  });

  it("starts the next opportunity from the actual profile, not a prior simulation", () => {
    const first = buildOpportunityResult({
      opportunityType: "internship",
      title: "Internship A",
      description: "React",
      profile: emptyProfile,
      role,
      skillIds: ["react", "frontend-development"],
    });
    const second = buildOpportunityResult({
      opportunityType: "project",
      title: "Project B",
      description: "Testing",
      profile: emptyProfile,
      role,
      skillIds: ["software-testing"],
    });

    expect(second.scoreBefore).toBe(first.scoreBefore);
    expect(second.projectedProfile.experiences).toHaveLength(1);
    expect(second.projectedProfile.experiences[0]?.title).toBe("Project B");
  });
});
