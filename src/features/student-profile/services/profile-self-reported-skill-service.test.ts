import { describe, expect, it } from "vitest";

import type { StudentProfile } from
  "../types/student-profile";

import {
  addSelfReportedSkills,
  removeSelfReportedSkill,
  renameSelfReportedSkill,
} from "./profile-self-reported-skill-service";

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

describe("addSelfReportedSkills", () => {
  it("marks only the direct root as self-reported and derives implications", () => {
    const result = addSelfReportedSkills(createProfile(), ["AWS"]);

    expect(skillById(result, "aws")).toEqual({
      id: "aws",
      name: "AWS",
      status: "developing",
      selfReported: true,
    });
    expect(skillById(result, "cloud-platform")).toEqual({
      id: "cloud-platform",
      name: "Cloud Platform",
      status: "developing",
    });
    expect(skillById(result, "cloud-platform")?.selfReported).toBeUndefined();
  });
});

describe("removeSelfReportedSkill", () => {
  it("does not strip activity-backed evidence", () => {
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
          id: "react",
          name: "React",
          status: "demonstrated",
          selfReported: true,
        },
      ],
    });

    const result = removeSelfReportedSkill(profile, "react");

    expect(result.experiences[0]?.skillIds).toEqual(["react"]);
    expect(skillById(result, "react")).toEqual({
      id: "react",
      name: "React",
      status: "demonstrated",
    });
  });

  it("keeps React as a derived skill when Next.js remains a root", () => {
    const profile = addSelfReportedSkills(createProfile(), [
      "Next.js",
      "React",
    ]);

    const result = removeSelfReportedSkill(profile, "react");

    expect(skillById(result, "nextjs")?.selfReported).toBe(true);
    expect(skillById(result, "react")).toEqual({
      id: "react",
      name: "React",
      status: "developing",
    });
    expect(skillById(result, "react")?.selfReported).toBeUndefined();
  });

  it("keeps an independent React root after Next.js is removed", () => {
    const profile = addSelfReportedSkills(createProfile(), [
      "Next.js",
      "React",
    ]);

    const result = removeSelfReportedSkill(profile, "nextjs");

    expect(skillById(result, "nextjs")).toBeUndefined();
    expect(skillById(result, "react")).toEqual({
      id: "react",
      name: "React",
      status: "developing",
      selfReported: true,
    });
  });

  it("removes implied-only evidence after the last supporting root is gone", () => {
    const profile = addSelfReportedSkills(createProfile(), ["AWS"]);
    const result = removeSelfReportedSkill(profile, "aws");

    expect(result.skills).toEqual([]);
  });
});

describe("renameSelfReportedSkill", () => {
  it("moves the self-reported root without rewriting activities", () => {
    const profile = createProfile({
      experiences: [
        {
          id: "experience-1",
          title: "Cloud work",
          status: "completed",
          skillIds: ["aws"],
        },
      ],
      skills: [
        {
          id: "aws",
          name: "AWS",
          status: "demonstrated",
          selfReported: true,
        },
      ],
    });

    const result = renameSelfReportedSkill(profile, "aws", "Azure");

    expect(result.experiences[0]?.skillIds).toEqual(["aws"]);
    expect(skillById(result, "aws")).toEqual({
      id: "aws",
      name: "AWS",
      status: "demonstrated",
    });
    expect(skillById(result, "azure")?.selfReported).toBe(true);
  });
});
