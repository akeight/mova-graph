import {
    describe,
    expect,
    it,
  } from "vitest";
  
  import type { StudentProfile } from
    "../types/student-profile";
  
  import { reconcileProfileSkills } from
    "./reconcile-profile-skills";
  
  function createProfile(
    overrides: Partial<StudentProfile> = {},
  ): StudentProfile {
    return {
      id: "student-1",
      name: "Student",
      courses: [],
      experiences: [],
      skills: [],
      ...overrides,
    };
  }
  
  describe(
    "reconcileProfileSkills",
    () => {
      it("marks completed evidence as demonstrated", () => {
        const profile = createProfile({
          courses: [
            {
              id: "course-1",
              title: "TypeScript",
              status: "completed",
              skillIds: ["typescript"],
            },
          ],
  
          skills: [
            {
              id: "typescript",
              name: "TypeScript",
              status: "developing",
            },
          ],
        });
  
        expect(
          reconcileProfileSkills(profile)
            .skills,
        ).toEqual([
          {
            id: "typescript",
            name: "TypeScript",
            status: "demonstrated",
          },
        ]);
      });
  
      it("marks in-progress evidence as developing", () => {
        const profile = createProfile({
          experiences: [
            {
              id: "experience-1",
              title: "Mobile project",
              status: "in-progress",
              skillIds: [
                "mobile-development",
              ],
            },
          ],
        });
  
        expect(
          reconcileProfileSkills(profile)
            .skills,
        ).toEqual([
          {
            id: "mobile-development",
            name: "Mobile Development",
            status: "developing",
          },
        ]);
      });
  
      it("does not award credit for planned evidence", () => {
        const profile = createProfile({
          courses: [
            {
              id: "course-1",
              title: "Future course",
              status: "planned",
              skillIds: ["python"],
            },
          ],
        });
  
        expect(
          reconcileProfileSkills(profile)
            .skills,
        ).toEqual([]);
      });
  
      it("does not award credit for dropped evidence", () => {
        const profile = createProfile({
          experiences: [
            {
              id: "experience-1",
              title: "Dropped project",
              status: "dropped",
              skillIds: ["react"],
            },
          ],
  
          skills: [
            {
              id: "react",
              name: "React",
              status: "demonstrated",
            },
          ],
        });
  
        expect(
          reconcileProfileSkills(profile)
            .skills,
        ).toEqual([]);
      });
  
      it("keeps a skill demonstrated when another source is dropped", () => {
        const profile = createProfile({
          courses: [
            {
              id: "course-1",
              title: "React course",
              status: "completed",
              skillIds: ["react"],
            },
          ],
  
          experiences: [
            {
              id: "experience-1",
              title: "Old React project",
              status: "dropped",
              skillIds: ["react"],
            },
          ],
  
          skills: [
            {
              id: "react",
              name: "React",
              status: "demonstrated",
            },
          ],
        });
  
        expect(
          reconcileProfileSkills(profile)
            .skills,
        ).toEqual([
          {
            id: "react",
            name: "React",
            status: "demonstrated",
          },
        ]);
      });
    },
  );