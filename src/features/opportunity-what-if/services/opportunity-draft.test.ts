import { describe, expect, it } from "vitest";

import type { ExtractedSkill } from
  "@/features/skill-analysis/types/profile-item-extraction";
import { shouldPreselectExtractedSkill } from
  "@/features/skill-analysis/services/normalize-extraction";

import {
  addManualDraftSkill,
  createOpportunityDraft,
  removeDraftSkill,
  selectedDirectSkills,
  toggleDraftSkill,
} from "./opportunity-draft";
import type { OpportunityExtraction } from
  "../types/opportunity-what-if";

const skills: ExtractedSkill[] = [
  {
    id: "react",
    name: "React",
    confidence: 0.96,
    evidence: "Build React interfaces",
    provenance: "direct",
    sourcePhrase: "React",
  },
  {
    id: "frontend-development",
    name: "Frontend Development",
    confidence: 0.96,
    evidence: "Build React interfaces",
    provenance: "derived",
    derivedFromSkillId: "react",
  },
  {
    id: "api-development",
    name: "API Development",
    confidence: 0.68,
    evidence: "integrate REST APIs",
    provenance: "direct",
    sourcePhrase: "REST APIs",
  },
  {
    id: "atlasflow",
    name: "AtlasFlow",
    confidence: 0.9,
    evidence: "AtlasFlow",
    provenance: "direct",
    normalizationMethod: "unmapped",
    sourcePhrase: "AtlasFlow",
  },
];

const extraction: OpportunityExtraction = {
  opportunityType: "internship",
  title: "Software Engineering Intern",
  description: "Build React interfaces.",
  skills,
};

describe("opportunity-draft", () => {
  it("preselects high-confidence direct evidence only", () => {
    const draft = createOpportunityDraft(extraction);

    expect(draft.selectedSkillIds).toEqual(["react"]);
    expect(shouldPreselectExtractedSkill(skills[2]!)).toBe(false);
    expect(selectedDirectSkills(draft).map((skill) => skill.id)).toEqual([
      "react",
    ]);
  });

  it("does not select derived or unmapped evidence by default", () => {
    const draft = createOpportunityDraft(extraction);

    expect(draft.selectedSkillIds).not.toContain("frontend-development");
    expect(draft.selectedSkillIds).not.toContain("atlasflow");
  });

  it("ignores toggles on derived evidence", () => {
    const draft = createOpportunityDraft(extraction);
    const next = toggleDraftSkill(draft, "frontend-development", true);

    expect(next.selectedSkillIds).toEqual(["react"]);
  });

  it("lets the student approve low-confidence evidence explicitly", () => {
    const draft = toggleDraftSkill(
      createOpportunityDraft(extraction),
      "api-development",
      true,
    );

    expect(draft.selectedSkillIds).toEqual(["react", "api-development"]);
  });

  it("adds and removes direct evidence", () => {
    const withManual = addManualDraftSkill(
      createOpportunityDraft(extraction),
      "TypeScript",
    );

    expect(withManual.selectedSkillIds).toContain("typescript");

    const removed = removeDraftSkill(withManual, "react");

    expect(removed.skills.map((skill) => skill.id)).not.toContain("react");
    expect(removed.skills.map((skill) => skill.id)).not.toContain(
      "frontend-development",
    );
    expect(removed.selectedSkillIds).not.toContain("react");
  });
});
