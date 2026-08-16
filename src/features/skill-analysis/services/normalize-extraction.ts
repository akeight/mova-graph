import {
  expandEvidenceImplications,
  createUnmappedEvidenceId,
  isPhraseGroundedInSource,
  isSkillGroundedInText,
  resolveEvidenceTerm,
} from "@/features/goals/services/normalize-evidence";

import {
  getEvidenceSkill,
  requiresExplicitSourceGrounding,
} from "@/features/goals/data/evidence-skills";

import type {
  ExtractedSkill,
  ProfileItemExtraction,
  ProfileItemKind,
} from "../types/profile-item-extraction";

import type {
  RawProfileItemExtraction,
} from "../schemas/profile-item-extraction";

function normalizeConfidence(confidence: number): number {
  return Math.round(confidence * 100) / 100;
}

function createUnmappedSkill(
  sourcePhrase: string,
  evidence: string,
  confidence = 0,
): ExtractedSkill {
  const trimmed = sourcePhrase.trim();

  return {
    id: createUnmappedEvidenceId(trimmed),
    name: trimmed,
    sourcePhrase: trimmed,
    confidence: normalizeConfidence(confidence),
    evidence: evidence.trim(),
    normalizationMethod: "unmapped",
    provenance: "direct",
  };
}

function acceptDirectMappings(
  claim: RawProfileItemExtraction["skills"][number],
  sourceText: string,
): ExtractedSkill[] {
  const accepted: ExtractedSkill[] = [];
  const phraseResolution = resolveEvidenceTerm(claim.sourcePhrase);

  for (const mapping of claim.mappings) {
    const skill = getEvidenceSkill(mapping.canonicalSkillId);

    if (!skill) {
      continue;
    }

    if (requiresExplicitSourceGrounding(skill)) {
      if (!isSkillGroundedInText(skill, sourceText)) {
        continue;
      }
    }

    const phraseIsThisSkill =
      phraseResolution.direct.id === skill.id &&
      phraseResolution.direct.method !== "unmapped";

    accepted.push({
      id: skill.id,
      name: skill.name,
      sourcePhrase: claim.sourcePhrase.trim(),
      confidence: normalizeConfidence(mapping.confidence),
      evidence: claim.evidence.trim(),
      normalizationMethod: phraseIsThisSkill
        ? phraseResolution.direct.method
        : requiresExplicitSourceGrounding(skill)
          ? "exact-name"
          : "semantic",
      provenance: "direct",
      category: skill.category,
    });
  }

  return accepted;
}

function withDerivedSkills(direct: ExtractedSkill): ExtractedSkill[] {
  const derived = expandEvidenceImplications(
    direct.id,
    direct.sourcePhrase ?? direct.name,
  ).map((skill) => ({
    id: skill.id,
    name: skill.name,
    sourcePhrase: direct.sourcePhrase,
    confidence: direct.confidence,
    evidence: direct.evidence,
    normalizationMethod: "derived" as const,
    provenance: "derived" as const,
    derivedFromSkillId: skill.derivedFromSkillId ?? direct.id,
    category: skill.category,
  }));

  return [direct, ...derived];
}

function provenanceRank(
  skill: ExtractedSkill,
): number {
  return skill.provenance === "direct" ? 0 : 1;
}

function dedupeExtractedSkills(
  skills: ExtractedSkill[],
): ExtractedSkill[] {
  const chosen = new Map<string, { skill: ExtractedSkill; index: number }>();

  skills.forEach((skill, index) => {
    const existing = chosen.get(skill.id);

    if (!existing) {
      chosen.set(skill.id, { skill, index });
      return;
    }

    const existingRank = provenanceRank(existing.skill);
    const incomingRank = provenanceRank(skill);

    if (incomingRank < existingRank) {
      chosen.set(skill.id, { skill, index: existing.index });
      return;
    }

    if (incomingRank > existingRank) {
      return;
    }

    if (skill.confidence > existing.skill.confidence) {
      chosen.set(skill.id, { skill, index: existing.index });
    }
  });

  return Array.from(chosen.values())
    .sort((left, right) => left.index - right.index)
    .map((entry) => entry.skill);
}

export function shouldPreselectExtractedSkill(
  skill: ExtractedSkill,
): boolean {
  if (skill.provenance === "derived") {
    return false;
  }

  if (skill.normalizationMethod === "unmapped") {
    return false;
  }

  return skill.confidence >= 0.85;
}

export function expandApprovedEvidence(
  skills: ExtractedSkill[],
): ExtractedSkill[] {
  return dedupeExtractedSkills(
    skills.flatMap((skill) => withDerivedSkills(skill)),
  );
}

export function normalizeExtractedSkills(
  rawSkills: RawProfileItemExtraction["skills"],
  sourceText: string,
): ExtractedSkill[] {
  const collected: ExtractedSkill[] = [];

  for (const claim of rawSkills) {
    if (!isPhraseGroundedInSource(claim.sourcePhrase, sourceText)) {
      continue;
    }

    const directs = acceptDirectMappings(claim, sourceText);

    if (directs.length === 0) {
      collected.push(
        createUnmappedSkill(claim.sourcePhrase, claim.evidence),
      );
      continue;
    }

    for (const direct of directs) {
      collected.push(...withDerivedSkills(direct));
    }
  }

  return dedupeExtractedSkills(collected);
}

export function normalizeProfileItemExtraction(
  kind: ProfileItemKind,
  raw: RawProfileItemExtraction,
  sourceText: string,
): ProfileItemExtraction {
  return {
    kind,
    title: raw.title.trim(),
    description: raw.description.trim(),
    skills: normalizeExtractedSkills(raw.skills, sourceText),
  };
}
