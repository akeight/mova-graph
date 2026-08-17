import type { ResumeDraftItem } from "../types/resume-import";

import { combineProfileDescriptions } from
  "./combine-profile-descriptions";
import {
  mergeExtractedSkills,
  mergeSelectedSkillIds,
} from "./resume-draft-skills";

export function mergeResumeDraftItems(
  left: ResumeDraftItem,
  right: ResumeDraftItem,
): ResumeDraftItem {
  const leftTitle = left.title.trim();
  const rightTitle = right.title.trim();
  const title =
    leftTitle.includes(rightTitle) && rightTitle.length > 0
      ? leftTitle
      : rightTitle.includes(leftTitle) && leftTitle.length > 0
        ? rightTitle
        : leftTitle.length >= rightTitle.length
          ? leftTitle
          : rightTitle;

  const skills = mergeExtractedSkills(left.skills, right.skills);

  return {
    id: left.id,
    kind: left.kind,
    title,
    organization: left.organization || right.organization,
    startDate: left.startDate ?? right.startDate,
    endDate: left.endDate ?? right.endDate,
    description: combineProfileDescriptions(
      left.description,
      right.description,
    ),
    status:
      left.status === "completed" || right.status === "completed"
        ? "completed"
        : "in-progress",
    skills,
    selectedSkillIds: mergeSelectedSkillIds(
      skills,
      left.selectedSkillIds,
      right.selectedSkillIds,
    ),
    sourceIds: Array.from(
      new Set([...left.sourceIds, ...right.sourceIds]),
    ),
    existingItemId: left.existingItemId ?? right.existingItemId,
    existingCollection:
      left.existingCollection ?? right.existingCollection,
  };
}
