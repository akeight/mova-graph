import type { ExtractedSkill } from
  "@/features/skill-analysis/types/profile-item-extraction";

import type { ResumeDraftItem } from "../types/resume-import";

import { combineProfileDescriptions } from
  "./combine-profile-descriptions";

function mergeSkills(
  left: ExtractedSkill[],
  right: ExtractedSkill[],
): ExtractedSkill[] {
  const byId = new Map<string, ExtractedSkill>();

  for (const skill of [...left, ...right]) {
    const existing = byId.get(skill.id);

    if (!existing) {
      byId.set(skill.id, skill);
      continue;
    }

    if (
      existing.provenance === "derived" &&
      skill.provenance !== "derived"
    ) {
      byId.set(skill.id, skill);
    }
  }

  return Array.from(byId.values());
}

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
    skills: mergeSkills(left.skills, right.skills),
    sourceIds: Array.from(
      new Set([...left.sourceIds, ...right.sourceIds]),
    ),
    existingItemId: left.existingItemId ?? right.existingItemId,
    existingCollection:
      left.existingCollection ?? right.existingCollection,
  };
}
