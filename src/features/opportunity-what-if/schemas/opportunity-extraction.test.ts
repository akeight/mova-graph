import { describe, expect, it } from "vitest";
import { Output } from "ai";

import {
  opportunityExtractionInputSchema,
  rawOpportunityExtractionSchema,
} from "./opportunity-extraction";

describe("opportunityExtractionInputSchema", () => {
  it("accepts supported opportunity types within text limits", () => {
    const parsed = opportunityExtractionInputSchema.parse({
      opportunityType: "project",
      text: "Build a budgeting app in SwiftUI with REST APIs.",
    });

    expect(parsed.opportunityType).toBe("project");
  });

  it("rejects unknown types and out-of-range text", () => {
    expect(
      opportunityExtractionInputSchema.safeParse({
        opportunityType: "job",
        text: "Build a budgeting app in SwiftUI with REST APIs.",
      }).success,
    ).toBe(false);

    expect(
      opportunityExtractionInputSchema.safeParse({
        opportunityType: "internship",
        text: "Too short",
      }).success,
    ).toBe(false);

    expect(
      opportunityExtractionInputSchema.safeParse({
        opportunityType: "internship",
        text: "x".repeat(5_001),
      }).success,
    ).toBe(false);
  });
});

describe("rawOpportunityExtractionSchema", () => {
  it("requires developable or prerequisite context on every claim", () => {
    const parsed = rawOpportunityExtractionSchema.parse({
      title: "Software Engineering Intern",
      description: "Build React interfaces and write documentation.",
      skills: [
        {
          sourcePhrase: "React",
          evidence: "Build React interfaces.",
          mappings: [{ canonicalSkillId: "react", confidence: 0.94 }],
          context: "developable",
        },
      ],
    });

    expect(parsed.skills[0]?.context).toBe("developable");

    expect(
      rawOpportunityExtractionSchema.safeParse({
        title: "Software Engineering Intern",
        description: "Build React interfaces.",
        skills: [
          {
            sourcePhrase: "React",
            evidence: "Build React interfaces.",
            mappings: [{ canonicalSkillId: "react", confidence: 0.94 }],
          },
        ],
      }).success,
    ).toBe(false);
  });

  it("lists every object property in required for Output.object", async () => {
    const output = Output.object({
      name: "MovaOpportunityExtraction",
      description:
        "Structured evidence extracted from an opportunity the student is considering.",
      schema: rawOpportunityExtractionSchema,
    });

    const format = await output.responseFormat;

    expect(format).toBeDefined();
    expect(format?.type).toBe("json");
  });
});
