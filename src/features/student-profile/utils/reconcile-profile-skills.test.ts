import { describe, expect, it } from "vitest";

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

function skillById(profile: StudentProfile, skillId: string) {
  return profile.skills.find((skill) => skill.id === skillId);
}

describe("reconcileProfileSkills", () => {
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

    expect(reconcileProfileSkills(profile).skills).toEqual([
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
          skillIds: ["mobile-development"],
        },
      ],
    });

    expect(reconcileProfileSkills(profile).skills).toEqual([
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

    expect(reconcileProfileSkills(profile).skills).toEqual([]);
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

    expect(reconcileProfileSkills(profile).skills).toEqual([]);
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

    expect(reconcileProfileSkills(profile).skills).toEqual([
      {
        id: "react",
        name: "React",
        status: "demonstrated",
      },
    ]);
  });

  it("keeps a self-reported root as developing without activity", () => {
    const profile = createProfile({
      skills: [
        {
          id: "aws",
          name: "AWS",
          status: "developing",
          selfReported: true,
        },
      ],
    });

    const skills = reconcileProfileSkills(profile).skills;
    const aws = skillById({ ...profile, skills }, "aws");
    const cloud = skillById({ ...profile, skills }, "cloud-platform");

    expect(aws).toEqual({
      id: "aws",
      name: "AWS",
      status: "developing",
      selfReported: true,
    });
    expect(cloud).toEqual({
      id: "cloud-platform",
      name: "Cloud Platform",
      status: "developing",
    });
    expect(cloud?.selfReported).toBeUndefined();
  });

  it("does not mark implied skills as self-reported", () => {
    const profile = createProfile({
      skills: [
        {
          id: "aws",
          name: "AWS",
          status: "developing",
          selfReported: true,
        },
      ],
    });

    const cloud = skillById(
      reconcileProfileSkills(profile),
      "cloud-platform",
    );

    expect(cloud?.selfReported).toBeUndefined();
  });

  it("keeps a direct self-reported root when the same ID is also derived", () => {
    const profile = createProfile({
      skills: [
        {
          id: "nextjs",
          name: "Next.js",
          status: "developing",
          selfReported: true,
        },
        {
          id: "react",
          name: "React",
          status: "developing",
          selfReported: true,
        },
      ],
    });

    const result = reconcileProfileSkills(profile);
    const react = skillById(result, "react");

    expect(react).toEqual({
      id: "react",
      name: "React",
      status: "developing",
      selfReported: true,
    });
  });

  it("keeps selfReported when a derived-and-direct root is demonstrated", () => {
    const profile = createProfile({
      experiences: [
        {
          id: "experience-1",
          title: "Dashboard",
          status: "completed",
          skillIds: ["react"],
        },
      ],
      skills: [
        {
          id: "nextjs",
          name: "Next.js",
          status: "developing",
          selfReported: true,
        },
        {
          id: "react",
          name: "React",
          status: "developing",
          selfReported: true,
        },
      ],
    });

    const react = skillById(
      reconcileProfileSkills(profile),
      "react",
    );

    expect(react).toEqual({
      id: "react",
      name: "React",
      status: "demonstrated",
      selfReported: true,
    });
  });

  it("falls back to developing when a demonstrated activity is removed but the self-report remains", () => {
    const profile = createProfile({
      skills: [
        {
          id: "react",
          name: "React",
          status: "demonstrated",
          selfReported: true,
        },
      ],
    });

    const react = skillById(
      reconcileProfileSkills(profile),
      "react",
    );

    expect(react).toEqual({
      id: "react",
      name: "React",
      status: "developing",
      selfReported: true,
    });
  });
});
