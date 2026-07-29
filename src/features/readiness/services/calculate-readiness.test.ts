import {
    describe,
    expect,
    it,
  } from "vitest";
  
  import type { CareerRole } from
    "@/features/goals/types/career-role";
  import type { StudentProfile } from
    "@/features/student-profile/types/student-profile";
  
  import { calculateReadiness } from "./calculate-readiness";
  
  const role: CareerRole = {
    id: "test-role",
    title: "Test Role",
    requirements: [
      {
        skillId: "typescript",
        skillName: "TypeScript",
        importance: "required",
      },
      {
        skillId: "react",
        skillName: "React",
        importance: "required",
      },
      {
        skillId: "design-systems",
        skillName: "Design Systems",
        importance: "preferred",
      },
    ],
  };
  
  describe("calculateReadiness", () => {
    it("calculates weighted readiness coverage", () => {
      const profile: StudentProfile = {
        id: "student",
        name: "Student",
        courses: [
          {
            id: "typescript-course",
            title: "TypeScript",
            status: "completed",
            skillIds: ["typescript"],
          },
          {
            id: "react-course",
            title: "React",
            status: "in-progress",
            skillIds: ["react"],
          },
        ],
        experiences: [],
        skills: [
          {
            id: "typescript",
            name: "TypeScript",
            status: "demonstrated",
          },
          {
            id: "react",
            name: "React",
            status: "developing",
          },
        ],
      };
  
      const assessment =
        calculateReadiness(profile, role);
  
      expect(assessment.score).toBe(60);
      expect(
        assessment.demonstratedCount,
      ).toBe(1);
      expect(
        assessment.developingCount,
      ).toBe(1);
      expect(
        assessment.missingCount,
      ).toBe(1);
    });
  
    it("uses demonstrated when multiple activities support the same skill", () => {
      const profile: StudentProfile = {
        id: "student",
        name: "Student",
        courses: [
          {
            id: "react-course",
            title: "React Course",
            status: "in-progress",
            skillIds: ["react"],
          },
        ],
        experiences: [
          {
            id: "react-project",
            title: "React Project",
            status: "completed",
            skillIds: ["react"],
          },
        ],
        skills: [
          {
            id: "react",
            name: "React",
            status: "developing",
          },
        ],
      };
  
      const assessment =
        calculateReadiness(profile, role);
  
      const reactRequirement =
        assessment.requirements.find(
          (requirement) =>
            requirement.skillId === "react",
        );
  
      expect(reactRequirement?.status).toBe(
        "demonstrated",
      );
    });
  });