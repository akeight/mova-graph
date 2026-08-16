import {
  buildEvidenceLookupMap,
  createEvidenceLookupKey,
} from "@/features/goals/data/evidence-skills";

import type {
  ExtractedSkill,
  ProfileItemExtraction,
  ProfileItemKind,
} from "../types/profile-item-extraction";

import type {
  RawProfileItemExtraction,
} from "../schemas/profile-item-extraction";

type CanonicalSkill = {
  id: string;
  name: string;
};

const evidenceLookup = buildEvidenceLookupMap();

function createSkillId(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function resolveCanonicalSkill(name: string): CanonicalSkill {
  const lookupKey = createEvidenceLookupKey(name);
  const registrySkill = evidenceLookup.get(lookupKey);

  if (registrySkill) {
    return {
      id: registrySkill.id,
      name: registrySkill.name,
    };
  }

  return {
    id: createSkillId(name),
    name: name.trim(),
  };
}

function normalizeConfidence(confidence: number): number {
  return Math.round(confidence * 100) / 100;
}

export function normalizeExtractedSkills(
  rawSkills: RawProfileItemExtraction["skills"],
): ExtractedSkill[] {
  const skillsById = new Map<string, ExtractedSkill>();

  for (const rawSkill of rawSkills) {
    const canonical = resolveCanonicalSkill(rawSkill.name);

    if (!canonical.id) {
      continue;
    }

    const normalizedSkill: ExtractedSkill = {
      id: canonical.id,
      name: canonical.name,
      confidence: normalizeConfidence(rawSkill.confidence),
      evidence: rawSkill.evidence.trim(),
    };

    const existingSkill = skillsById.get(canonical.id);

    if (
      !existingSkill ||
      normalizedSkill.confidence > existingSkill.confidence
    ) {
      skillsById.set(canonical.id, normalizedSkill);
    }
  }

  return Array.from(skillsById.values()).sort(
    (left, right) =>
      right.confidence - left.confidence ||
      left.name.localeCompare(right.name),
  );
}

export function normalizeProfileItemExtraction(
  kind: ProfileItemKind,
  raw: RawProfileItemExtraction,
): ProfileItemExtraction {
  return {
    kind,
    title: raw.title.trim(),
    description: raw.description.trim(),
    skills: normalizeExtractedSkills(raw.skills),
  };
}
