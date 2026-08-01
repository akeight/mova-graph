import {
    describe,
    expect,
    it,
  } from "vitest";
  
  import type { StudentProfile } from
    "../types/student-profile";
  
  import {
    getManagedProfileSkills,
    removeProfileSkill,
    renameProfileSkill,
  } from "./profile-skill-service";
  
  const profile: StudentProfile = {
    id: "student-1",
    name: "Student",
  
    courses: [
      {
        id: "course-1",
        title: "Testing Foundations",
        status: "completed",
        skillIds: ["unit-testing"],
      },
  
      {
        id: "course-2",
        title: "Future Mobile Course",
        status: "planned",
        skillIds: ["mobile-development"],
      },
    ],
  
    experiences: [
      {
        id: "experience-1",
        title: "Software Internship",
        status: "in-progress",
  
        skillIds: [
          "software-testing",
          "unit-testing",
        ],
      },
    ],
  
    skills: [
      {
        id: "unit-testing",
        name: "Unit Testing",
        status: "demonstrated",
      },
  
      {
        id: "software-testing",
        name: "Software Testing",
        status: "developing",
      },
    ],
  };
  
  describe(
    "getManagedProfileSkills",
    () => {
      it("includes active and planned skills", () => {
        const result =
          getManagedProfileSkills(
            profile,
          );
  
        expect(
          result.map(
            (skill) => skill.id,
          ),
        ).toEqual([
          "mobile-development",
          "software-testing",
          "unit-testing",
        ]);
  
        expect(
          result.find(
            (skill) =>
              skill.id ===
              "mobile-development",
          )?.status,
        ).toBe("planned");
      });
  
      it("returns linked evidence sources", () => {
        const result =
          getManagedProfileSkills(
            profile,
          );
  
        const unitTesting =
          result.find(
            (skill) =>
              skill.id ===
              "unit-testing",
          );
  
        expect(
          unitTesting?.sources,
        ).toHaveLength(2);
      });
    },
  );
  
  describe(
    "renameProfileSkill",
    () => {
      it("updates every linked skill ID", () => {
        const result =
          renameProfileSkill(
            profile,
            "unit-testing",
            "Automated Testing",
          );
  
        expect(
          result.courses[0].skillIds,
        ).toEqual([
          "automated-testing",
        ]);
  
        expect(
          result.experiences[0]
            .skillIds,
        ).toContain(
          "automated-testing",
        );
      });
  
      it("merges into an existing skill ID", () => {
        const result =
          renameProfileSkill(
            profile,
            "unit-testing",
            "Software Testing",
          );
  
        expect(
          result.courses[0].skillIds,
        ).toEqual([
          "software-testing",
        ]);
  
        expect(
          result.experiences[0]
            .skillIds,
        ).toEqual([
          "software-testing",
        ]);
  
        expect(
          result.skills.filter(
            (skill) =>
              skill.id ===
              "software-testing",
          ),
        ).toHaveLength(1);
  
        expect(
          result.skills.find(
            (skill) =>
              skill.id ===
              "software-testing",
          )?.status,
        ).toBe("demonstrated");
      });
    },
  );
  
  describe(
    "removeProfileSkill",
    () => {
      it("removes the skill from every linked item", () => {
        const result =
          removeProfileSkill(
            profile,
            "unit-testing",
          );
  
        expect(
          result.courses[0].skillIds,
        ).toEqual([]);
  
        expect(
          result.experiences[0]
            .skillIds,
        ).toEqual([
          "software-testing",
        ]);
  
        expect(
          result.skills.some(
            (skill) =>
              skill.id ===
              "unit-testing",
          ),
        ).toBe(false);
      });
    },
  );