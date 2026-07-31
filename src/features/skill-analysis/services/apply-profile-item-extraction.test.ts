import {
    describe,
    expect,
    it,
  } from "vitest";
  
  import type { StudentProfile } from
    "@/features/student-profile/types/student-profile";
  
  import type { ApprovedProfileItem } from
    "../types/profile-item-extraction";
  
  import {
    applyApprovedProfileItem,
  } from "./apply-profile-item-extraction";
  
  const profile: StudentProfile = {
    id: "student-1",
    name: "Student",
    program: "Software Engineering",
    courses: [],
    experiences: [],
    skills: [],
  };
  
  describe(
    "applyApprovedProfileItem",
    () => {
      it("adds an approved completed course", () => {
        const item: ApprovedProfileItem = {
          kind: "course",
          title: "Web Development",
          description:
            "Built modern web applications.",
          status: "completed",
  
          skills: [
            {
              id: "typescript",
              name: "TypeScript",
              confidence: 0.98,
              evidence:
                "Used TypeScript throughout the course.",
            },
            {
              id: "react",
              name: "React",
              confidence: 0.95,
              evidence:
                "Built React interfaces.",
            },
          ],
        };
  
        const result =
          applyApprovedProfileItem(
            profile,
            item,
            () => "course-ai",
          );
  
        expect(result.courses).toEqual([
          {
            id: "course-ai",
            title: "Web Development",
            description:
              "Built modern web applications.",
            status: "completed",
            skillIds: [
              "typescript",
              "react",
            ],
          },
        ]);
  
        expect(result.skills).toEqual([
          {
            id: "typescript",
            name: "TypeScript",
            status: "demonstrated",
          },
          {
            id: "react",
            name: "React",
            status: "demonstrated",
          },
        ]);
      });
  
      it("adds an in-progress experience with developing skills", () => {
        const item: ApprovedProfileItem = {
          kind: "experience",
          title: "Design System Project",
          status: "in-progress",
  
          skills: [
            {
              id: "design-systems",
              name: "Design Systems",
              confidence: 0.91,
              evidence:
                "Created reusable components.",
            },
          ],
        };
  
        const result =
          applyApprovedProfileItem(
            profile,
            item,
            () => "experience-ai",
          );
  
        expect(result.experiences).toEqual([
          {
            id: "experience-ai",
            title: "Design System Project",
            description: undefined,
            status: "in-progress",
            skillIds: [
              "design-systems",
            ],
          },
        ]);
  
        expect(result.skills).toEqual([
          {
            id: "design-systems",
            name: "Design Systems",
            status: "developing",
          },
        ]);
      });
  
      it("adds only the approved skills supplied by the UI", () => {
        const item: ApprovedProfileItem = {
          kind: "experience",
          title: "Internship Tracker",
          status: "completed",
  
          skills: [
            {
              id: "typescript",
              name: "TypeScript",
              confidence: 0.98,
              evidence:
                "Built the application in TypeScript.",
            },
          ],
        };
  
        const result =
          applyApprovedProfileItem(
            profile,
            item,
            () => "experience-ai",
          );
  
        expect(
          result.experiences[0].skillIds,
        ).toEqual(["typescript"]);
      });
  
      it("does not mutate the original profile", () => {
        const originalProfile =
          structuredClone(profile);
  
        const item: ApprovedProfileItem = {
          kind: "course",
          title: "Database Foundations",
          status: "planned",
  
          skills: [
            {
              id: "postgresql",
              name: "PostgreSQL",
              confidence: 0.89,
              evidence:
                "The course covers relational databases.",
            },
          ],
        };
  
        applyApprovedProfileItem(
          profile,
          item,
          () => "course-ai",
        );
  
        expect(profile).toEqual(
          originalProfile,
        );
      });
  
      it("rejects an item without approved skills", () => {
        const item: ApprovedProfileItem = {
          kind: "experience",
          title: "Project",
          status: "completed",
          skills: [],
        };
  
        expect(() =>
          applyApprovedProfileItem(
            profile,
            item,
            () => "experience-ai",
          ),
        ).toThrow(
          "Select at least one skill before adding the profile item.",
        );
      });
    },
  );