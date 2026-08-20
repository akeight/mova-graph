import { describe, expect, it } from "vitest";

import { getCareerRole } from "@/features/goals/data/career-roles";
import { calculateReadiness } from "@/features/readiness/services/calculate-readiness";
import type { StudentProfile } from "@/features/student-profile/types/student-profile";

import { simulateEvidencePackage } from "./simulate-evidence-package";

const role = getCareerRole("product-engineer");

const emptyProfile: StudentProfile = {
  id: "student",
  name: "Student",
  courses: [],
  experiences: [],
  skills: [],
};

const reactDemonstratedProfile: StudentProfile = {
  id: "student",
  name: "Student",
  courses: [
    {
      id: "react-course",
      title: "React Course",
      status: "completed",
      skillIds: ["react", "frontend-development"],
    },
  ],
  experiences: [],
  skills: [
    { id: "react", name: "React", status: "demonstrated" },
    {
      id: "frontend-development",
      name: "Frontend Development",
      status: "demonstrated",
    },
  ],
};

describe("simulateEvidencePackage", () => {
  it("does not mutate the original student profile", () => {
    const originalProfile = structuredClone(emptyProfile);

    simulateEvidencePackage(emptyProfile, role, {
      idSuffix: "opportunity",
      title: "Internship",
      description: "Build React interfaces.",
      skillIds: ["react", "frontend-development"],
    });

    expect(emptyProfile).toEqual(originalProfile);
  });

  it("matches calculateReadiness on the projected clone", () => {
    const result = simulateEvidencePackage(emptyProfile, role, {
      idSuffix: "opportunity",
      title: "Internship",
      description: "Build React interfaces.",
      skillIds: ["react", "frontend-development"],
    });

    expect(result.scoreAfter).toBe(
      calculateReadiness(result.projectedProfile, role).score,
    );
    expect(result.scoreBefore).toBe(
      calculateReadiness(emptyProfile, role).score,
    );
    expect(result.scoreIncrease).toBe(
      result.scoreAfter - result.scoreBefore,
    );
  });

  it("never reduces readiness when completed evidence is added", () => {
    const result = simulateEvidencePackage(emptyProfile, role, {
      idSuffix: "opportunity",
      title: "Internship",
      description: "Build React interfaces.",
      skillIds: ["react", "frontend-development"],
    });

    expect(result.scoreAfter).toBeGreaterThanOrEqual(result.scoreBefore);
  });

  it("does not double-credit evidence already demonstrated", () => {
    const baseline = calculateReadiness(reactDemonstratedProfile, role);
    const result = simulateEvidencePackage(
      reactDemonstratedProfile,
      role,
      {
        idSuffix: "opportunity",
        title: "Another React project",
        description: "Build more React interfaces.",
        skillIds: ["react", "frontend-development"],
      },
    );

    const userFacing = (assessment: typeof baseline) =>
      assessment.competencies.find(
        (competency) =>
          competency.competencyId === "user-facing-engineering",
      );

    expect(result.scoreAfter).toBe(result.scoreBefore);
    expect(userFacing(result.projectedAssessment)?.competencyCredit).toBe(
      userFacing(baseline)?.competencyCredit,
    );
  });

  it("does not move the general score for specialized-only evidence", () => {
    const result = simulateEvidencePackage(emptyProfile, role, {
      idSuffix: "opportunity",
      title: "Performance workshop",
      description: "Learn application performance.",
      skillIds: ["performance"],
    });

    const performance = result.projectedAssessment.competencies.find(
      (competency) =>
        competency.competencyId === "application-performance",
    );

    expect(result.scoreAfter).toBe(result.scoreBefore);
    expect(performance?.competencyCredit).toBeGreaterThan(0);
  });

  it("creates a completed temporary experience on the clone only", () => {
    const result = simulateEvidencePackage(emptyProfile, role, {
      idSuffix: "opportunity",
      title: "Internship",
      description: "Build React interfaces.",
      skillIds: ["react"],
    });

    expect(emptyProfile.experiences).toEqual([]);
    expect(result.projectedProfile.experiences).toEqual([
      {
        id: "scenario-experience-opportunity",
        title: "Internship",
        description: "Build React interfaces.",
        status: "completed",
        skillIds: ["react"],
      },
    ]);
  });
});
