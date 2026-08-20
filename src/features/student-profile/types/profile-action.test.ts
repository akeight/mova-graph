import { describe, expect, it } from "vitest";

import {
  profileActionForSuggestedEvidence,
  quickAddPrefillSkillIds,
  quickAddSkillContext,
} from "./profile-action";

describe("quickAddSkillContext", () => {
  it("treats a missing or empty list as unscoped", () => {
    expect(quickAddSkillContext(undefined)).toBe("none");
    expect(quickAddSkillContext([])).toBe("none");
  });

  it("does not treat the first of several ids as the product context", () => {
    expect(quickAddSkillContext(["software-testing"])).toBe("single");
    expect(
      quickAddSkillContext(["frontend-development", "deployment"]),
    ).toBe("multiple");
  });
});

describe("quickAddPrefillSkillIds", () => {
  it("prefills only when there is exactly one contextual skill", () => {
    expect(quickAddPrefillSkillIds(["software-testing"])).toEqual([
      "software-testing",
    ]);
    expect(quickAddPrefillSkillIds([])).toEqual([]);
    expect(quickAddPrefillSkillIds(undefined)).toEqual([]);
  });

  it("does not prefill every recommendation suggestion", () => {
    expect(
      quickAddPrefillSkillIds([
        "react",
        "typescript",
        "software-testing",
      ]),
    ).toEqual([]);
  });
});

describe("profileActionForSuggestedEvidence", () => {
  it("uses a single suggested evidence id as manage-evidence context", () => {
    expect(profileActionForSuggestedEvidence(["software-testing"])).toEqual({
      mode: "manage-skill-evidence",
      skillId: "software-testing",
      intent: "add",
    });
  });

  it("opens unscoped or multi-option quick add when there is not exactly one id", () => {
    expect(profileActionForSuggestedEvidence([])).toEqual({
      mode: "quick-add",
    });
    expect(
      profileActionForSuggestedEvidence([
        "frontend-development",
        "deployment",
      ]),
    ).toEqual({
      mode: "quick-add",
      skillIds: ["frontend-development", "deployment"],
    });
  });
});
