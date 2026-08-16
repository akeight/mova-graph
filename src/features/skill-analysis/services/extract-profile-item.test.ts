import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  extractProfileItem,
} from "./extract-profile-item";

describe("extractProfileItem", () => {
  it("normalizes structured AI output", async () => {
    const generate = vi.fn(async () => ({
      title: "Internship Tracking Platform",
      description:
        "Built a full-stack application for tracking internship applications.",
      skills: [
        {
          sourcePhrase: "TypeScript",
          evidence:
            "The application was implemented in TypeScript.",
          mappings: [
            { canonicalSkillId: "typescript", confidence: 0.98 },
          ],
        },
        {
          sourcePhrase: "Postgres",
          evidence:
            "Application records were stored in Postgres.",
          mappings: [
            { canonicalSkillId: "postgresql", confidence: 0.9 },
          ],
        },
      ],
    }));

    const result = await extractProfileItem(
      {
        kind: "experience",
        text: [
          "I built an internship tracking platform using",
          "TypeScript and Postgres.",
        ].join(" "),
      },
      generate,
    );

    expect(generate).toHaveBeenCalledOnce();

    expect(result.kind).toBe("experience");
    expect(result.title).toBe("Internship Tracking Platform");
    expect(result.skills.map((skill) => skill.id)).toEqual([
      "typescript",
      "postgresql",
      "database-development",
    ]);
  });

  it("preserves unknown evidence from empty mappings", async () => {
    const generate = vi.fn(async () => ({
      title: "Workflow Prototype",
      description: "Built internal workflows using AtlasFlow.",
      skills: [
        {
          sourcePhrase: "AtlasFlow",
          evidence: "Built internal workflows using AtlasFlow.",
          mappings: [],
        },
      ],
    }));

    const result = await extractProfileItem(
      {
        kind: "experience",
        text: "Built internal workflows using a framework called AtlasFlow.",
      },
      generate,
    );

    expect(result.skills).toEqual([
      expect.objectContaining({
        id: "atlasflow",
        name: "AtlasFlow",
        normalizationMethod: "unmapped",
      }),
    ]);
  });
});
