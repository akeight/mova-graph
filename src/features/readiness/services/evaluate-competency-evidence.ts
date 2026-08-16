import type { CareerCompetencyDefinition } from "@/features/goals/types/career-role";
import { getEvidenceSkillName } from "@/features/goals/data/evidence-skills";
import type { StudentSkill } from "@/features/student-profile/types/student-profile";

import type {
  CompetencyEvidenceEvaluation,
  EvidenceMatch,
  EvidenceStatus,
  GroupEvaluation,
} from "../types/readiness";

const GROUP_CREDIT: Record<EvidenceStatus, 1 | 0.5 | 0> = {
  demonstrated: 1,
  developing: 0.5,
  missing: 0,
};

function getMinimumGroups(
  definition: CareerCompetencyDefinition,
): number {
  const groupCount = definition.evidence.groups.length;

  if (groupCount === 0) {
    return 1;
  }

  return definition.evidence.minimumGroups ?? groupCount;
}

function uniqueMatches(matches: EvidenceMatch[]): EvidenceMatch[] {
  const matchesById = new Map<string, EvidenceMatch>();

  for (const match of matches) {
    const existing = matchesById.get(match.skillId);

    if (!existing || match.status === "demonstrated") {
      matchesById.set(match.skillId, match);
    }
  }

  return Array.from(matchesById.values());
}

export function evaluateCompetencyEvidence(
  definition: CareerCompetencyDefinition,
  studentSkills: StudentSkill[],
): CompetencyEvidenceEvaluation {
  const studentSkillMap = new Map(
    studentSkills.map((skill) => [skill.id, skill]),
  );

  const groups: GroupEvaluation[] = definition.evidence.groups.map(
    (group) => {
      const matchedEvidence: EvidenceMatch[] = [];

      for (const skillId of group.skillIds) {
        const studentSkill = studentSkillMap.get(skillId);

        if (!studentSkill) {
          continue;
        }

        matchedEvidence.push({
          skillId,
          skillName: studentSkill.name || getEvidenceSkillName(skillId),
          status: studentSkill.status,
        });
      }

      const hasDemonstrated = matchedEvidence.some(
        (match) => match.status === "demonstrated",
      );
      const hasDeveloping = matchedEvidence.some(
        (match) => match.status === "developing",
      );

      const status: EvidenceStatus = hasDemonstrated
        ? "demonstrated"
        : hasDeveloping
          ? "developing"
          : "missing";

      return {
        groupId: group.id,
        status,
        credit: GROUP_CREDIT[status],
        matchedEvidence,
      };
    },
  );

  const groupProgress = groups.reduce(
    (total, group) => total + group.credit,
    0,
  );
  const minimumGroups = getMinimumGroups(definition);
  const competencyCredit = Math.min(1, groupProgress / minimumGroups);

  const demonstratedGroupCount = groups.filter(
    (group) => group.status === "demonstrated",
  ).length;

  const hasPartialEvidence = groups.some(
    (group) => group.status !== "missing",
  );

  const evidenceStatus: EvidenceStatus =
    demonstratedGroupCount >= minimumGroups
      ? "demonstrated"
      : hasPartialEvidence
        ? "developing"
        : "missing";

  return {
    evidenceStatus,
    groups,
    matchedEvidence: uniqueMatches(
      groups.flatMap((group) => group.matchedEvidence),
    ),
    groupProgress,
    competencyCredit,
  };
}

export function getMinimumGroupCount(
  definition: CareerCompetencyDefinition,
): number {
  return getMinimumGroups(definition);
}

export function suggestEvidenceSkillIds(
  definition: CareerCompetencyDefinition,
  groups: GroupEvaluation[],
): string[] {
  const minimumGroups = getMinimumGroups(definition);
  const demonstratedCount = groups.filter(
    (group) => group.status === "demonstrated",
  ).length;
  const remaining = minimumGroups - demonstratedCount;

  if (remaining <= 0) {
    return [];
  }

  const evaluationByGroupId = new Map(
    groups.map((group) => [group.groupId, group]),
  );

  const candidates = definition.evidence.groups.filter((group) => {
    return evaluationByGroupId.get(group.id)?.status !== "demonstrated";
  });

  const developingFirst = [...candidates].sort((left, right) => {
    const leftStatus = evaluationByGroupId.get(left.id)?.status;
    const rightStatus = evaluationByGroupId.get(right.id)?.status;
    const leftRank = leftStatus === "developing" ? 0 : 1;
    const rightRank = rightStatus === "developing" ? 0 : 1;

    return leftRank - rightRank;
  });

  const selected = developingFirst.slice(0, remaining);
  const skillIds: string[] = [];

  for (const group of selected) {
    const evaluation = evaluationByGroupId.get(group.id);
    const developingSkillId = group.skillIds.find((skillId) =>
      evaluation?.matchedEvidence.some(
        (match) =>
          match.skillId === skillId && match.status === "developing",
      ),
    );
    const skillId = developingSkillId ?? group.skillIds[0];

    if (skillId && !skillIds.includes(skillId)) {
      skillIds.push(skillId);
    }
  }

  return skillIds;
}
