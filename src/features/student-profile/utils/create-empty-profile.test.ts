import { describe, expect, it } from "vitest";

import { studentProfileSchema } from
  "@/features/persistence/schemas/workspace";
import { sampleStudentProfile } from
  "@/features/pathway-graph/data/sample-student";

import { createEmptyProfile } from "./create-empty-profile";

describe("createEmptyProfile", () => {
  it("returns a profile with no courses, experiences, or skills", () => {
    const profile = createEmptyProfile();

    expect(profile.courses).toEqual([]);
    expect(profile.experiences).toEqual([]);
    expect(profile.skills).toEqual([]);
  });

  it("does not contain the sample/demo data", () => {
    const profile = createEmptyProfile();

    expect(profile.id).not.toBe(sampleStudentProfile.id);
    expect(profile.name).not.toBe(sampleStudentProfile.name);
    expect(profile).not.toEqual(sampleStudentProfile);
  });

  it("produces a profile that satisfies the persistence schema", () => {
    const result = studentProfileSchema.safeParse(
      createEmptyProfile(),
    );

    expect(result.success).toBe(true);
  });

  it("uses the provided name and id", () => {
    const profile = createEmptyProfile({
      id: "custom-id",
      name: "Jordan",
    });

    expect(profile.id).toBe("custom-id");
    expect(profile.name).toBe("Jordan");
  });

  it("falls back to a default name when given a blank name", () => {
    const profile = createEmptyProfile({ name: "   " });

    expect(profile.name).toBe("New student");
  });
});
