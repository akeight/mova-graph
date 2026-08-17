import { describe, expect, it } from "vitest";

import {
  createManualDraftSkill,
  mergeExtractedSkills,
  mergeSelectedSkillIds,
  selectedDirectSkillIds,
} from "./resume-draft-skills";

describe("resume-draft-skills", () => {
  it("preselects only direct mapped evidence at or above 0.85", () => {
    expect(
      selectedDirectSkillIds([
        {
          id: "react",
          name: "React",
          confidence: 0.92,
          evidence: "React",
          provenance: "direct",
        },
        {
          id: "typescript",
          name: "TypeScript",
          confidence: 0.7,
          evidence: "TypeScript",
          provenance: "direct",
        },
        {
          id: "atlasflow",
          name: "AtlasFlow",
          confidence: 0.99,
          evidence: "AtlasFlow",
          provenance: "direct",
          normalizationMethod: "unmapped",
        },
        {
          id: "frontend-development",
          name: "Frontend Development",
          confidence: 0.99,
          evidence: "Derived",
          provenance: "derived",
          derivedFromSkillId: "react",
        },
      ]),
    ).toEqual(["react"]);
  });

  it("does not let derived IDs survive selection merge", () => {
    expect(
      mergeSelectedSkillIds(
        [
          {
            id: "react",
            name: "React",
            confidence: 0.9,
            evidence: "Derived",
            provenance: "derived",
          },
        ],
        ["react"],
        ["react"],
      ),
    ).toEqual([]);
  });

  it("lets direct evidence beat derived on the same id", () => {
    const merged = mergeExtractedSkills(
      [
        {
          id: "react",
          name: "React",
          confidence: 0.99,
          evidence: "Derived",
          provenance: "derived",
        },
      ],
      [
        {
          id: "react",
          name: "React",
          confidence: 0.7,
          evidence: "Direct",
          provenance: "direct",
        },
      ],
    );

    expect(merged[0]).toMatchObject({
      provenance: "direct",
      confidence: 0.7,
    });
  });

  it("creates a selected-ready manual term without another AI call", () => {
    const skill = createManualDraftSkill("Next.js");

    expect(skill).toMatchObject({
      id: "nextjs",
      name: "Next.js",
      provenance: "direct",
      confidence: 1,
    });
    expect(selectedDirectSkillIds([skill!])).toEqual(["nextjs"]);
  });
});
