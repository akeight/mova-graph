import {
    describe,
    expect,
    it,
  } from "vitest";
  
  import type { StudentProfile } from
    "../types/student-profile";
  
  import {
    addProfileItem,
    removeProfileItem,
    updateProfileItem,
  } from "./profile-item-service";
  
  const profile: StudentProfile = {
    id: "student-1",
    name: "Student",
  
    courses: [
      {
        id: "course-1",
        title: "Web Development",
        status: "completed",
        skillIds: ["react"],
      },
    ],
  
    experiences: [
      {
        id: "experience-1",
        title: "Mobile Project",
        status: "in-progress",
        skillIds: [
          "mobile-development",
        ],
      },
    ],
  
    skills: [
      {
        id: "react",
        name: "React",
        status: "demonstrated",
      },
      {
        id: "mobile-development",
        name: "Mobile Development",
        status: "developing",
      },
    ],
  };
  
  describe("updateProfileItem", () => {
    it("updates a course and its linked skills", () => {
      const result =
        updateProfileItem(profile, {
          kind: "course",
          itemId: "course-1",
          title:
            "Advanced Web Development",
          description:
            "Built full-stack applications.",
          status: "completed",
          skillNames: [
            "TypeScript",
            "React",
          ],
        });
  
      expect(result.courses[0]).toEqual({
        id: "course-1",
        title:
          "Advanced Web Development",
        description:
          "Built full-stack applications.",
        status: "completed",
        skillIds: [
          "typescript",
          "react",
          "frontend-development",
        ],
      });
  
      expect(
        result.skills.map(
          (skill) => skill.id,
        ),
      ).toContain("typescript");
    });
  
    it("removes readiness credit when an item is dropped", () => {
      const result =
        updateProfileItem(profile, {
          kind: "course",
          itemId: "course-1",
          title: "Web Development",
          status: "dropped",
          skillNames: ["React"],
        });
  
      expect(
        result.skills.some(
          (skill) =>
            skill.id === "react",
        ),
      ).toBe(false);
    });
  
    it("canonicalizes aliases and expands implications", () => {
      const result =
        updateProfileItem(profile, {
          kind: "course",
          itemId: "course-1",
          title: "Web Development",
          status: "completed",
          skillNames: [
            "Postgres",
            "PostgreSQL",
          ],
        });

      expect(result.courses[0].skillIds).toEqual([
        "postgresql",
        "database-development",
      ]);
    });

    it("keeps a dropped item in profile history", () => {
      const result =
        updateProfileItem(profile, {
          kind: "experience",
          itemId: "experience-1",
          title: "Mobile Project",
          status: "dropped",
          skillNames: [
            "Mobile Development",
          ],
        });
  
      expect(
        result.experiences[0].status,
      ).toBe("dropped");
    });

    it("persists imported experience organization and constrained dates", () => {
      const result = updateProfileItem(profile, {
        kind: "experience",
        itemId: "experience-1",
        title: "Mobile Project",
        status: "completed",
        skillNames: ["Mobile Development"],
        organization: "Acme",
        startDate: "2024-06",
        endDate: "2025",
      });

      expect(result.experiences[0]).toMatchObject({
        organization: "Acme",
        startDate: "2024-06",
        endDate: "2025",
      });
    });

    it("rejects an invalid experience month instead of persisting it", () => {
      const seeded = updateProfileItem(profile, {
        kind: "experience",
        itemId: "experience-1",
        title: "Mobile Project",
        status: "in-progress",
        skillNames: ["Mobile Development"],
        organization: "Acme",
        startDate: "2024-06",
        endDate: "2025-08",
      });

      const result = updateProfileItem(seeded, {
        kind: "experience",
        itemId: "experience-1",
        title: "Mobile Project",
        status: "in-progress",
        skillNames: ["Mobile Development"],
        organization: "Acme",
        startDate: "2024-13",
        endDate: "2025-08",
      });

      expect(result.experiences[0]?.startDate).toBeUndefined();
      expect(result.experiences[0]?.endDate).toBe("2025-08");
    });

    it("clears an explicitly blank organization", () => {
      const seeded = updateProfileItem(profile, {
        kind: "experience",
        itemId: "experience-1",
        title: "Mobile Project",
        status: "in-progress",
        skillNames: ["Mobile Development"],
        organization: "Acme",
      });

      const result = updateProfileItem(seeded, {
        kind: "experience",
        itemId: "experience-1",
        title: "Mobile Project",
        status: "in-progress",
        skillNames: ["Mobile Development"],
        organization: "",
      });

      expect(result.experiences[0]?.organization).toBeUndefined();
    });

    it("clears explicitly blank startDate and endDate", () => {
      const seeded = updateProfileItem(profile, {
        kind: "experience",
        itemId: "experience-1",
        title: "Mobile Project",
        status: "in-progress",
        skillNames: ["Mobile Development"],
        startDate: "2025-05",
        endDate: "2025-08",
      });

      const result = updateProfileItem(seeded, {
        kind: "experience",
        itemId: "experience-1",
        title: "Mobile Project",
        status: "in-progress",
        skillNames: ["Mobile Development"],
        startDate: "",
        endDate: "",
      });

      expect(result.experiences[0]?.startDate).toBeUndefined();
      expect(result.experiences[0]?.endDate).toBeUndefined();
    });

    it("marks linked skills demonstrated when an in-progress item is completed", () => {
      const inProgress = updateProfileItem(profile, {
        kind: "experience",
        itemId: "experience-1",
        title: "Mobile Project",
        status: "in-progress",
        skillNames: ["Mobile Development"],
      });

      expect(
        inProgress.skills.find((skill) => skill.id === "mobile-development")
          ?.status,
      ).toBe("developing");

      const completed = updateProfileItem(inProgress, {
        kind: "experience",
        itemId: "experience-1",
        title: "Mobile Project",
        status: "completed",
        skillNames: ["Mobile Development"],
      });

      expect(
        completed.skills.find((skill) => skill.id === "mobile-development")
          ?.status,
      ).toBe("demonstrated");
    });

    it("returns a skill to developing when completed evidence is set in-progress", () => {
      const completed = updateProfileItem(profile, {
        kind: "experience",
        itemId: "experience-1",
        title: "Mobile Project",
        status: "completed",
        skillNames: ["React"],
      });

      expect(
        completed.skills.find((skill) => skill.id === "react")?.status,
      ).toBe("demonstrated");

      const inProgress = updateProfileItem(completed, {
        kind: "experience",
        itemId: "experience-1",
        title: "Mobile Project",
        status: "in-progress",
        skillNames: ["React"],
      });

      expect(
        inProgress.skills.find((skill) => skill.id === "react")?.status,
      ).toBe("demonstrated");

      const withoutCourse = removeProfileItem(
        inProgress,
        "course",
        "course-1",
      );

      expect(
        withoutCourse.skills.find((skill) => skill.id === "react")?.status,
      ).toBe("developing");
    });

    it("preserves organization and dates when those fields are omitted", () => {
      const seeded = updateProfileItem(profile, {
        kind: "experience",
        itemId: "experience-1",
        title: "Mobile Project",
        status: "in-progress",
        skillNames: ["Mobile Development"],
        organization: "Acme",
        startDate: "2025-05",
        endDate: "2025-08",
      });

      const result = updateProfileItem(seeded, {
        kind: "experience",
        itemId: "experience-1",
        title: "Updated Mobile Project",
        status: "completed",
        skillNames: ["Mobile Development", "React"],
      });

      expect(result.experiences[0]).toMatchObject({
        title: "Updated Mobile Project",
        organization: "Acme",
        startDate: "2025-05",
        endDate: "2025-08",
      });
    });
  });
  
  describe("addProfileItem", () => {
    it("creates a project experience with kind=project and expanded evidence", () => {
      const result = addProfileItem(profile, {
        kind: "experience",
        title: "HackHQ",
        status: "completed",
        skillNames: ["Software Testing"],
        experienceKind: "project",
      }, () => "experience-new");

      expect(result.experiences.at(-1)).toMatchObject({
        id: "experience-new",
        title: "HackHQ",
        status: "completed",
        kind: "project",
        skillIds: ["software-testing"],
      });
    });

    it("creates a certification course with kind=certification", () => {
      const result = addProfileItem(profile, {
        kind: "course",
        title: "AWS Cloud Practitioner",
        status: "completed",
        skillNames: ["AWS"],
        courseKind: "certification",
      }, () => "course-new");

      expect(result.courses.at(-1)).toMatchObject({
        id: "course-new",
        title: "AWS Cloud Practitioner",
        kind: "certification",
        skillIds: ["aws", "cloud-platform"],
      });
    });

    it("preselects a canonical evidence skill without storing a competency id", () => {
      const result = addProfileItem(profile, {
        kind: "experience",
        title: "Testing project",
        status: "completed",
        skillNames: ["Software Testing"],
        experienceKind: "project",
      }, () => "experience-new");

      expect(result.experiences.at(-1)?.skillIds).toEqual(["software-testing"]);
      expect(result.experiences.at(-1)?.skillIds).not.toContain(
        "software-quality",
      );
    });
  });

  describe("removeProfileItem", () => {
    it("permanently removes a course", () => {
      const result =
        removeProfileItem(
          profile,
          "course",
          "course-1",
        );
  
      expect(result.courses).toEqual([]);
  
      expect(
        result.skills.some(
          (skill) =>
            skill.id === "react",
        ),
      ).toBe(false);
    });
  });