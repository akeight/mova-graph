import { describe, expect, it } from "vitest";

import {
  profileActionForSuggestedEvidence,
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
