import { describe, expect, it } from "vitest";

import { normalizeExtractedSkills } from "./normalize-extraction";

describe("normalizeExtractedSkills", () => {
  it("maps API Development to the api-development capability, not api-design", () => {
    const skills = normalizeExtractedSkills([
      {
        name: "API Development",
        confidence: 0.9,
        evidence: "Built REST APIs.",
      },
    ]);

    expect(skills).toEqual([
      expect.objectContaining({
        id: "api-development",
        name: "API Development",
      }),
    ]);
  });

  it("does not map product development to product-thinking", () => {
    const skills = normalizeExtractedSkills([
      {
        name: "product development",
        confidence: 0.8,
        evidence: "Shipped a product.",
      },
    ]);

    expect(skills[0]?.id).not.toBe("product-thinking");
  });
});
