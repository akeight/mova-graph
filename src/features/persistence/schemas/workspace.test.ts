import { describe, expect, it } from "vitest";

import {
  storedWorkspaceSnapshotSchema,
  workspaceIdSchema,
  workspaceSnapshotSchema,
} from "./workspace";

const validProfile = {
  id: "student-1",
  name: "Student",
  program: "Software Engineering",

  courses: [
    {
      id: "course-1",
      title: "Web Development",
      status: "completed" as const,
      skillIds: ["typescript", "react"],
    },
  ],

  experiences: [],

  skills: [
    {
      id: "typescript",
      name: "TypeScript",
      status: "demonstrated" as const,
    },
  ],
};

const validSnapshot = {
  version: 2 as const,
  selectedRoleId: "product-engineer",
  profile: validProfile,
  onboarding: {
    completed: true,
    step: "finish" as const,
  },
};

describe("workspaceSnapshotSchema", () => {
  it("accepts a valid version 2 workspace with onboarding", () => {
    expect(
      workspaceSnapshotSchema.parse(validSnapshot),
    ).toEqual(validSnapshot);
  });

  it("rejects a snapshot without onboarding", () => {
    const { onboarding, ...withoutOnboarding } =
      validSnapshot;

    void onboarding;

    expect(
      workspaceSnapshotSchema.safeParse(withoutOnboarding)
        .success,
    ).toBe(false);
  });

  it("rejects unsupported role IDs", () => {
    const result = workspaceSnapshotSchema.safeParse({
      ...validSnapshot,
      selectedRoleId: "invented-role",
    });

    expect(result.success).toBe(false);
  });

  it("rejects invalid course progress", () => {
    const result = workspaceSnapshotSchema.safeParse({
      ...validSnapshot,

      profile: {
        ...validSnapshot.profile,
        courses: [
          {
            ...validSnapshot.profile.courses[0],
            status: "maybe",
          },
        ],
      },
    });

    expect(result.success).toBe(false);
  });
});

describe("storedWorkspaceSnapshotSchema", () => {
  it("normalizes a legacy version 1 snapshot without onboarding", () => {
    const legacy = {
      version: 1 as const,
      selectedRoleId: "product-engineer",
      profile: validProfile,
    };

    const parsed =
      storedWorkspaceSnapshotSchema.parse(legacy);

    expect(parsed.version).toBe(2);
    expect(parsed.onboarding).toEqual({
      completed: false,
      step: "career-goal",
    });
  });

  it("preserves onboarding from a version 2 snapshot", () => {
    const parsed =
      storedWorkspaceSnapshotSchema.parse(validSnapshot);

    expect(parsed.onboarding).toEqual(
      validSnapshot.onboarding,
    );
  });
});

describe("workspaceIdSchema", () => {
  it("accepts UUID workspace IDs", () => {
    expect(
      workspaceIdSchema.safeParse(
        "a5f18354-3143-4a5e-a57c-b00e72fb7db6",
      ).success,
    ).toBe(true);
  });

  it("rejects arbitrary IDs", () => {
    expect(
      workspaceIdSchema.safeParse("student-1").success,
    ).toBe(false);
  });
});
