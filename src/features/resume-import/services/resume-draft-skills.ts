import { resolveEvidenceTerm } from
  "@/features/goals/services/normalize-evidence";
import {
  expandApprovedEvidence,
  shouldPreselectExtractedSkill,
} from "@/features/skill-analysis/services/normalize-extraction";
import type { ExtractedSkill } from
  "@/features/skill-analysis/types/profile-item-extraction";
import type { ResumeDraftItem } from "../types/resume-import";

export const MANUAL_DRAFT_SKILL_EVIDENCE = "Added during review";

export function isDirectDraftSkill(skill: ExtractedSkill): boolean {
  return skill.provenance !== "derived";
}

export function isManualDraftSkill(skill: ExtractedSkill): boolean {
  return (
    isDirectDraftSkill(skill) &&
    skill.evidence === MANUAL_DRAFT_SKILL_EVIDENCE
  );
}

export function selectedDirectSkillIds(
  skills: ExtractedSkill[],
): string[] {
  return skills
    .filter(shouldPreselectExtractedSkill)
    .map((skill) => skill.id);
}

export function mergeExtractedSkills(
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

    const existingDerived = existing.provenance === "derived";
    const incomingDerived = skill.provenance === "derived";

    if (existingDerived && !incomingDerived) {
      byId.set(skill.id, skill);
      continue;
    }

    if (!existingDerived && incomingDerived) {
      continue;
    }

    if (skill.confidence > existing.confidence) {
      byId.set(skill.id, skill);
    }
  }

  return Array.from(byId.values());
}

export function mergeSelectedSkillIds(
  skills: ExtractedSkill[],
  leftSelected: string[],
  rightSelected: string[],
): string[] {
  const directIds = new Set(
    skills.filter(isDirectDraftSkill).map((skill) => skill.id),
  );

  return Array.from(
    new Set([...leftSelected, ...rightSelected]),
  ).filter((id) => directIds.has(id));
}

export function approvedSkillIdsFromSelection(
  skills: ExtractedSkill[],
  selectedSkillIds: string[],
): string[] {
  const selectedDirect = skills.filter(
    (skill) =>
      selectedSkillIds.includes(skill.id) &&
      isDirectDraftSkill(skill),
  );

  return Array.from(
    new Set(
      expandApprovedEvidence(selectedDirect).map((skill) => skill.id),
    ),
  );
}

export function createManualDraftSkill(
  skillName: string,
): ExtractedSkill | null {
  const trimmed = skillName.trim();

  if (!trimmed) {
    return null;
  }

  const resolved = resolveEvidenceTerm(trimmed);

  return {
    id: resolved.direct.id,
    name: resolved.direct.name,
    sourcePhrase: resolved.direct.sourcePhrase,
    confidence: 1,
    evidence: MANUAL_DRAFT_SKILL_EVIDENCE,
    normalizationMethod: resolved.direct.method,
    provenance: "direct",
  };
}

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
