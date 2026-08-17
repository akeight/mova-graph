import {
    describe,
    expect,
    it,
  } from "vitest";
  
  import type { StudentProfile } from
    "../types/student-profile";
  
  import {
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