import type { ExtractedSkill } from
  "@/features/skill-analysis/types/profile-item-extraction";
import {
  createManualDraftSkill,
  isDirectExtractedSkill,
  mergeExtractedSkills,
  mergeSelectedSkillIds,
  removeExtractedSkill,
  selectedDirectSkillIds,
} from "@/features/skill-analysis/services/extracted-skill-review";

import type {
  OpportunityEvidenceDraft,
  OpportunityExtraction,
} from "../types/opportunity-what-if";

export function createOpportunityDraft(
  extraction: OpportunityExtraction,
): OpportunityEvidenceDraft {
  return {
    ...extraction,
    selectedSkillIds: selectedDirectSkillIds(extraction.skills),
  };
}

export function toggleDraftSkill(
  draft: OpportunityEvidenceDraft,
  skillId: string,
  selected: boolean,
): OpportunityEvidenceDraft {
  const skill = draft.skills.find((entry) => entry.id === skillId);

  if (!skill || !isDirectExtractedSkill(skill)) {
    return draft;
  }

  return {
    ...draft,
    selectedSkillIds: selected
      ? Array.from(new Set([...draft.selectedSkillIds, skillId]))
      : draft.selectedSkillIds.filter((id) => id !== skillId),
  };
}

export function removeDraftSkill(
  draft: OpportunityEvidenceDraft,
  skillId: string,
): OpportunityEvidenceDraft {
  const skills = removeExtractedSkill(draft.skills, skillId);
  const directIds = new Set(
    skills.filter(isDirectExtractedSkill).map((skill) => skill.id),
  );

  return {
    ...draft,
    skills,
    selectedSkillIds: draft.selectedSkillIds.filter((id) =>
      directIds.has(id),
    ),
  };
}

export function addManualDraftSkill(
  draft: OpportunityEvidenceDraft,
  skillName: string,
): OpportunityEvidenceDraft {
  const created = createManualDraftSkill(skillName);

  if (!created) {
    return draft;
  }

  const skills = mergeExtractedSkills(draft.skills, [created]);

  return {
    ...draft,
    skills,
    selectedSkillIds: mergeSelectedSkillIds(
      skills,
      draft.selectedSkillIds,
      [created.id],
    ),
  };
}

export function selectedDirectSkills(
  draft: OpportunityEvidenceDraft,
): ExtractedSkill[] {
  return draft.skills.filter(
    (skill) =>
      isDirectExtractedSkill(skill) &&
      draft.selectedSkillIds.includes(skill.id),
  );
}
