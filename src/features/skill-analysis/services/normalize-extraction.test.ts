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

  it("maps broad platform terms to capabilities, not languages", () => {
    expect(
      normalizeExtractedSkills([
        { name: "iOS", confidence: 0.9, evidence: "Built an iOS app." },
      ])[0],
    ).toEqual(
      expect.objectContaining({
        id: "ios-development",
        name: "iOS Development",
      }),
    );

    expect(
      normalizeExtractedSkills([
        {
          name: "Android",
          confidence: 0.9,
          evidence: "Built an Android app.",
        },
      ])[0],
    ).toEqual(
      expect.objectContaining({
        id: "android-development",
        name: "Android Development",
      }),
    );
  });

  it("keeps Swift and Kotlin as concrete technologies", () => {
    expect(
      normalizeExtractedSkills([
        { name: "Swift", confidence: 0.9, evidence: "Wrote Swift code." },
      ])[0]?.id,
    ).toBe("swift");

    expect(
      normalizeExtractedSkills([
        {
          name: "Kotlin",
          confidence: 0.9,
          evidence: "Wrote Kotlin code.",
        },
      ])[0]?.id,
    ).toBe("kotlin");
  });
});
