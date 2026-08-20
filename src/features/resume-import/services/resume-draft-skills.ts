import {
  approvedSkillIdsFromSelection,
  createManualDraftSkill,
  isDirectExtractedSkill,
  isManualExtractedSkill,
  MANUAL_DRAFT_SKILL_EVIDENCE,
  mergeExtractedSkills,
  mergeSelectedSkillIds,
  selectedDirectSkillIds,
} from "@/features/skill-analysis/services/extracted-skill-review";
import type { ResumeDraftItem } from "../types/resume-import";

export {
  approvedSkillIdsFromSelection,
  createManualDraftSkill,
  isDirectExtractedSkill as isDirectDraftSkill,
  isManualExtractedSkill as isManualDraftSkill,
  MANUAL_DRAFT_SKILL_EVIDENCE,
  mergeExtractedSkills,
  mergeSelectedSkillIds,
  selectedDirectSkillIds,
};

export function addManualSkillToDraftItem(
  item: ResumeDraftItem,
  skillName: string,
): ResumeDraftItem {
  const created = createManualDraftSkill(skillName);

  if (!created) {
    return item;
  }

  const skills = mergeExtractedSkills(item.skills, [created]);

  return {
    ...item,
    skills,
    selectedSkillIds: mergeSelectedSkillIds(
      skills,
      item.selectedSkillIds,
      [created.id],
    ),
  };
}
