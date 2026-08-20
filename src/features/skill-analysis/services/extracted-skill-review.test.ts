import { describe, expect, it } from "vitest";

import type { ExtractedSkill } from "../types/profile-item-extraction";

import {
  approvedSkillIdsFromSelection,
  createManualDraftSkill,
  isDirectExtractedSkill,
  mergeExtractedSkills,
  mergeSelectedSkillIds,
  removeExtractedSkill,
  selectedDirectSkillIds,
} from "./extracted-skill-review";

const skills: ExtractedSkill[] = [
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
];

describe("extracted-skill-review", () => {
  it("treats derived evidence as not independently selectable", () => {
    expect(skills.filter(isDirectExtractedSkill).map((skill) => skill.id)).toEqual([
      "react",
      "typescript",
      "atlasflow",
    ]);
  });

  it("preselects only direct mapped evidence at or above 0.85", () => {
    expect(selectedDirectSkillIds(skills)).toEqual(["react"]);
  });

  it("expands approved direct evidence with implications", () => {
    expect(approvedSkillIdsFromSelection(skills, ["react"])).toEqual([
      "react",
      "frontend-development",
    ]);
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

  it("removes a direct skill and its derived implications", () => {
    expect(
      removeExtractedSkill(skills, "react").map((skill) => skill.id),
    ).toEqual(["typescript", "atlasflow"]);
  });
});
