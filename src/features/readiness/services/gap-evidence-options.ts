import { getCompetencyDefinition } from "@/features/goals/data/competencies";
import { getEvidenceSkillName } from "@/features/goals/data/evidence-skills";

import type {
  CompetencyReadiness,
  EvidenceStatus,
} from "../types/readiness";

export type GapEvidenceOption = {
  groupId: string;
  skillId: string;
  skillName: string;
  status: Exclude<EvidenceStatus, "demonstrated">;
  alternativeNames: string[];
};

function uniqueNames(names: string[]): string[] {
  const seen = new Set<string>();
  const unique: string[] = [];

  for (const name of names) {
    const key = name.trim().toLowerCase();

    if (!key || seen.has(key)) {
      continue;
    }

    seen.add(key);
    unique.push(name);
  }

  return unique;
}

export function getActionableGapEvidence(
  competency: CompetencyReadiness,
): GapEvidenceOption[] {
  if (competency.evidenceStatus === "demonstrated") {
    return [];
  }

  const definition = getCompetencyDefinition(competency.competencyId);
  const evaluationByGroupId = new Map(
    competency.groups.map((group) => [group.groupId, group]),
  );
  const options: GapEvidenceOption[] = [];

  for (const group of definition.evidence.groups) {
    const evaluation = evaluationByGroupId.get(group.id);

    if (evaluation?.status === "demonstrated") {
      continue;
    }

    const developingSkillId = group.skillIds.find((skillId) =>
      evaluation?.matchedEvidence.some(
        (match) =>
          match.skillId === skillId && match.status === "developing",
      ),
    );
    const skillId = developingSkillId ?? group.skillIds[0];

    if (!skillId) {
      continue;
    }

    const skillName = getEvidenceSkillName(skillId);
    const alternativeNames = uniqueNames(
      group.skillIds
        .filter((id) => id !== skillId)
        .map((id) => getEvidenceSkillName(id))
        .filter((name) => name.toLowerCase() !== skillName.toLowerCase()),
    );

    options.push({
      groupId: group.id,
      skillId,
      skillName,
      status: evaluation?.status === "developing" ? "developing" : "missing",
      alternativeNames,
    });
  }

  return options;
}
