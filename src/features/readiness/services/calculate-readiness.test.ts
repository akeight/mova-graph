import { describe, expect, it } from "vitest";

import { careerRoles, getCareerRole } from "@/features/goals/data/career-roles";
import type { StudentProfile } from "@/features/student-profile/types/student-profile";
import { sampleStudentProfile } from "@/features/pathway-graph/data/sample-student";

import { calculateReadiness } from "./calculate-readiness";
import {
  COMMON_SCORE_WEIGHT,
  CORE_SCORE_WEIGHT,
} from "../types/readiness";

function profileWithSkills(
  skills: Array<{ id: string; status: "demonstrated" | "developing" }>,
): StudentProfile {
  return {
    id: "student",
    name: "Student",
    courses: skills.map((skill) => ({
      id: `${skill.id}-course`,
      title: skill.id,
      status:
        skill.status === "demonstrated" ? "completed" : "in-progress",
      skillIds: [skill.id],
    })),
    experiences: [],
    skills: skills.map((skill) => ({
      id: skill.id,
      name: skill.id,
      status: skill.status,
    })),
  };
}

describe("calculateReadiness", () => {
  it("uses 60/40 average core and common coverage", () => {
    const role = getCareerRole("product-engineer");
    const profile = profileWithSkills([
      { id: "product-thinking", status: "demonstrated" },
    ]);

    const assessment = calculateReadiness(profile, role);
    const expected = Math.round(
      (assessment.core.coverage * CORE_SCORE_WEIGHT +
        assessment.common.coverage * COMMON_SCORE_WEIGHT) *
        100,
    );

    expect(assessment.score).toBe(expected);
    expect(assessment.score).toBe(
      Math.round((assessment.coreCoverage * 0.6 +
        assessment.commonCoverage * 0.4) * 100),
    );
  });

  it("does not reduce general readiness for unexplored specialized tracks", () => {
    const role = getCareerRole("mobile-engineer");
    const profile = profileWithSkills([
      { id: "mobile-development", status: "demonstrated" },
      { id: "software-testing", status: "demonstrated" },
      { id: "swift", status: "demonstrated" },
    ]);

    const assessment = calculateReadiness(profile, role);
    const ios = assessment.competencies.find(
      (competency) =>
        competency.competencyId === "ios-development-specialization",
    );
    const android = assessment.competencies.find(
      (competency) =>
        competency.competencyId === "android-development-specialization",
    );

    expect(ios?.evidenceStatus).toBe("demonstrated");
    expect(ios?.displayStatus).toBe("demonstrated");
    expect(android?.evidenceStatus).toBe("missing");
    expect(android?.displayStatus).toBe("not-explored");
    expect(assessment.specialized.notExploredCount).toBe(1);
    expect(assessment.specialized.missingCount).toBe(0);
    expect(
      assessment.specialized.demonstratedCount +
        assessment.specialized.developingCount +
        assessment.specialized.missingCount +
        assessment.specialized.notExploredCount,
    ).toBe(assessment.specialized.total);
    expect(assessment.score).toBe(
      Math.round(
        (assessment.core.coverage * 0.6 +
          assessment.common.coverage * 0.4) *
          100,
      ),
    );
  });

  it("lets Swift demonstrate iOS without implying Android", () => {
    const assessment = calculateReadiness(
      profileWithSkills([{ id: "swift", status: "demonstrated" }]),
      getCareerRole("mobile-engineer"),
    );

    expect(
      assessment.competencies.find(
        (competency) =>
          competency.competencyId === "mobile-application-development",
      )?.evidenceStatus,
    ).toBe("demonstrated");
    expect(
      assessment.competencies.find(
        (competency) =>
          competency.competencyId === "ios-development-specialization",
      )?.evidenceStatus,
    ).toBe("demonstrated");
    expect(
      assessment.competencies.find(
        (competency) =>
          competency.competencyId === "android-development-specialization",
      )?.displayStatus,
    ).toBe("not-explored");
  });

  it("lets Kotlin demonstrate Android without implying iOS", () => {
    const assessment = calculateReadiness(
      profileWithSkills([
        { id: "kotlin", status: "demonstrated" },
      ]),
      getCareerRole("mobile-engineer"),
    );

    expect(
      assessment.competencies.find(
        (competency) =>
          competency.competencyId === "android-development-specialization",
      )?.evidenceStatus,
    ).toBe("demonstrated");
    expect(
      assessment.competencies.find(
        (competency) =>
          competency.competencyId === "ios-development-specialization",
      )?.displayStatus,
    ).toBe("not-explored");
  });

  it("keeps software-quality consistent across roles", () => {
    const profile = profileWithSkills([
      { id: "software-testing", status: "demonstrated" },
    ]);

    for (const role of careerRoles) {
      const competency = calculateReadiness(profile, role).competencies.find(
        (current) => current.competencyId === "software-quality",
      );

      expect(competency?.evidenceStatus).toBe("demonstrated");
    }
  });

  it("returns matched evidence and group results", () => {
    const assessment = calculateReadiness(
      profileWithSkills([{ id: "react", status: "demonstrated" }]),
      getCareerRole("product-engineer"),
    );

    const userFacing = assessment.competencies.find(
      (competency) => competency.competencyId === "user-facing-engineering",
    );

    expect(userFacing?.groups).toHaveLength(2);
    expect(userFacing?.matchedEvidence).toEqual([
      expect.objectContaining({
        skillId: "react",
        status: "demonstrated",
      }),
    ]);
    expect(userFacing?.evidenceStatus).toBe("developing");
  });

  it("produces valid assessments for all four roles on the sample profile", () => {
    for (const role of careerRoles) {
      const assessment = calculateReadiness(sampleStudentProfile, role);

      expect(assessment.score).toBeGreaterThanOrEqual(0);
      expect(assessment.score).toBeLessThanOrEqual(100);
      expect(
        assessment.demonstratedCount +
          assessment.developingCount +
          assessment.missingCount,
      ).toBe(assessment.totalCompetencies);
      expect(assessment.competencies.length).toBe(role.competencies.length);
    }
  });
});
