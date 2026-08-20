import { resolveEvidenceTerm } from
  "@/features/goals/services/normalize-evidence";
import type { ExtractedSkill } from
  "../types/profile-item-extraction";

import {
  expandApprovedEvidence,
  shouldPreselectExtractedSkill,
} from "./normalize-extraction";

export const MANUAL_DRAFT_SKILL_EVIDENCE = "Added during review";

export function isDirectExtractedSkill(
  skill: ExtractedSkill,
): boolean {
  return skill.provenance !== "derived";
}

export function isManualExtractedSkill(
  skill: ExtractedSkill,
): boolean {
  return (
    isDirectExtractedSkill(skill) &&
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
    skills.filter(isDirectExtractedSkill).map((skill) => skill.id),
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
      isDirectExtractedSkill(skill),
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

export function removeExtractedSkill(
  skills: ExtractedSkill[],
  skillId: string,
): ExtractedSkill[] {
  return skills.filter(
    (skill) =>
      skill.id !== skillId && skill.derivedFromSkillId !== skillId,
  );
}
