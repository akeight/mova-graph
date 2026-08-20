import { describe, expect, it } from "vitest";

import type { StudentProfile } from "../types/student-profile";

import {
  expandSkillIdsForLink,
  linkSkillToProfileItem,
  unlinkSkillFromProfileItem,
  unlinkSkillIdsFromActivity,
} from "./link-skill-to-profile-item";

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

function snapshot(profile: StudentProfile) {
  return structuredClone(profile);
}

describe("expandSkillIdsForLink", () => {
  it("expands a canonical root the same way as profile item editing", () => {
    expect(
      expandSkillIdsForLink(createProfile(), "react"),
    ).toEqual(["react", "frontend-development"]);
  });
});

describe("unlinkSkillIdsFromActivity", () => {
  it("removes a root and its stored deterministic implications", () => {
    expect(
      unlinkSkillIdsFromActivity(
        ["react", "frontend-development"],
        "react",
      ),
    ).toEqual([]);
  });

  it("keeps unrelated evidence and implications of remaining independent roots", () => {
    expect(
      unlinkSkillIdsFromActivity(
        ["csharp", "react", "frontend-development"],
        "react",
      ),
    ).toEqual(["csharp"]);
  });

  it("keeps overlapping implications still produced by another independent root", () => {
    expect(
      unlinkSkillIdsFromActivity(
        ["nextjs", "react", "frontend-development"],
        "react",
      ),
    ).toEqual(["nextjs", "frontend-development"]);
  });
});

describe("linkSkillToProfileItem", () => {
  it("does not mutate the original profile", () => {
    const profile = createProfile({
      experiences: [
        {
          id: "hackhq",
          title: "HackHQ",
          status: "completed",
          skillIds: ["csharp"],
          kind: "project",
        },
      ],
      skills: [
        {
          id: "react",
          name: "React",
          status: "developing",
          selfReported: true,
        },
      ],
    });
    const original = snapshot(profile);

    linkSkillToProfileItem(profile, "react", {
      kind: "experience",
      itemId: "hackhq",
    });

    expect(profile).toEqual(original);
  });

  it("links a self-reported skill to a completed activity as demonstrated", () => {
    const profile = createProfile({
      experiences: [
        {
          id: "hackhq",
          title: "HackHQ",
          status: "completed",
          skillIds: ["csharp"],
          kind: "project",
        },
      ],
      skills: [
        {
          id: "react",
          name: "React",
          status: "developing",
          selfReported: true,
        },
      ],
    });

    const result = linkSkillToProfileItem(profile, "react", {
      kind: "experience",
      itemId: "hackhq",
    });

    expect(result.experiences[0]?.skillIds).toEqual([
      "csharp",
      "react",
      "frontend-development",
    ]);
    expect(skillById(result, "react")).toEqual({
      id: "react",
      name: "React",
      status: "demonstrated",
      selfReported: true,
    });
    expect(result).not.toBe(profile);
  });

  it("links a skill to an in-progress activity as developing", () => {
    const profile = createProfile({
      experiences: [
        {
          id: "itron",
          title: "Itron",
          status: "in-progress",
          skillIds: ["csharp"],
          kind: "work",
        },
      ],
      skills: [
        {
          id: "react",
          name: "React",
          status: "developing",
          selfReported: true,
        },
      ],
    });

    const result = linkSkillToProfileItem(profile, "react", {
      kind: "experience",
      itemId: "itron",
    });

    expect(skillById(result, "react")?.status).toBe("developing");
    expect(skillById(result, "react")?.selfReported).toBe(true);
  });

  it("does not duplicate an already linked skillId", () => {
    const profile = createProfile({
      experiences: [
        {
          id: "hackhq",
          title: "HackHQ",
          status: "completed",
          skillIds: ["react", "frontend-development"],
          kind: "project",
        },
      ],
    });

    const result = linkSkillToProfileItem(profile, "react", {
      kind: "experience",
      itemId: "hackhq",
    });

    expect(result).toBe(profile);
    expect(result.experiences[0]?.skillIds).toEqual([
      "react",
      "frontend-development",
    ]);
  });

  it("returns the original profile for an unknown item id", () => {
    const profile = createProfile();

    expect(
      linkSkillToProfileItem(profile, "react", {
        kind: "experience",
        itemId: "missing",
      }),
    ).toBe(profile);
  });

  it("never writes a competency id as a skill id", () => {
    const profile = createProfile({
      experiences: [
        {
          id: "hackhq",
          title: "HackHQ",
          status: "completed",
          skillIds: [],
          kind: "project",
        },
      ],
    });

    const result = linkSkillToProfileItem(profile, "software-testing", {
      kind: "experience",
      itemId: "hackhq",
    });

    expect(result.experiences[0]?.skillIds).toEqual(["software-testing"]);
    expect(result.experiences[0]?.skillIds).not.toContain("software-quality");
  });
});

describe("unlinkSkillFromProfileItem", () => {
  it("unlinks one of multiple sources and preserves the other", () => {
    const profile = createProfile({
      courses: [
        {
          id: "web-dev",
          title: "Web Development",
          status: "completed",
          skillIds: ["react", "frontend-development"],
        },
      ],
      experiences: [
        {
          id: "hackhq",
          title: "HackHQ",
          status: "completed",
          skillIds: ["react", "frontend-development"],
          kind: "project",
        },
      ],
    });

    const result = unlinkSkillFromProfileItem(profile, "react", {
      kind: "experience",
      itemId: "hackhq",
    });

    expect(result.experiences[0]?.skillIds).toEqual([]);
    expect(result.courses[0]?.skillIds).toEqual([
      "react",
      "frontend-development",
    ]);
    expect(skillById(result, "react")?.status).toBe("demonstrated");
  });

  it("removes React and React-derived Frontend Development from HackHQ", () => {
    const profile = createProfile({
      experiences: [
        {
          id: "hackhq",
          title: "HackHQ",
          status: "completed",
          skillIds: ["react", "frontend-development"],
          kind: "project",
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

    const result = unlinkSkillFromProfileItem(profile, "react", {
      kind: "experience",
      itemId: "hackhq",
    });

    expect(result.experiences[0]?.skillIds).toEqual([]);
    expect(result.experiences[0]?.skillIds).not.toContain("react");
    expect(result.experiences[0]?.skillIds).not.toContain(
      "frontend-development",
    );
    expect(skillById(result, "react")).toEqual({
      id: "react",
      name: "React",
      status: "developing",
      selfReported: true,
    });
  });

  it("leaves a self-reported skill developing after the final activity unlink", () => {
    const profile = createProfile({
      experiences: [
        {
          id: "hackhq",
          title: "HackHQ",
          status: "in-progress",
          skillIds: ["react", "frontend-development"],
          kind: "project",
        },
      ],
      skills: [
        {
          id: "react",
          name: "React",
          status: "developing",
          selfReported: true,
        },
      ],
    });

    const result = unlinkSkillFromProfileItem(profile, "react", {
      kind: "experience",
      itemId: "hackhq",
    });

    expect(skillById(result, "react")).toEqual({
      id: "react",
      name: "React",
      status: "developing",
      selfReported: true,
    });
  });

  it("removes a non-self-reported skill after its final contributing source", () => {
    const profile = createProfile({
      experiences: [
        {
          id: "hackhq",
          title: "HackHQ",
          status: "completed",
          skillIds: ["react", "frontend-development"],
          kind: "project",
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

    const result = unlinkSkillFromProfileItem(profile, "react", {
      kind: "experience",
      itemId: "hackhq",
    });

    expect(skillById(result, "react")).toBeUndefined();
    expect(skillById(result, "frontend-development")).toBeUndefined();
  });

  it("returns the original profile for an unknown item id", () => {
    const profile = createProfile();

    expect(
      unlinkSkillFromProfileItem(profile, "react", {
        kind: "course",
        itemId: "missing",
      }),
    ).toBe(profile);
  });
});
