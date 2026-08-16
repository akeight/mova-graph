import type {
  CareerCompetencyTier,
  CareerRole,
} from "@/features/goals/types/career-role";
import { getCompetencyDefinition } from "@/features/goals/data/competencies";
import { calculateReadiness } from "@/features/readiness/services/calculate-readiness";
import { suggestEvidenceSkillIds } from "@/features/readiness/services/evaluate-competency-evidence";
import type {
  CompetencyReadiness,
  EvidenceStatus,
} from "@/features/readiness/types/readiness";
import { applyEvidencePackageToProfile } from "@/features/student-profile/services/apply-evidence-package";
import type { StudentProfile } from "@/features/student-profile/types/student-profile";

import type {
  GenerateRecommendationsOptions,
  NextMoveRecommendation,
  RecommendationActionType,
  RecommendationPriorityLevel,
} from "../types/recommendation";

type ActionableStatus = Exclude<EvidenceStatus, "demonstrated">;

type ActionableCompetency = CompetencyReadiness & {
  evidenceStatus: ActionableStatus;
  tier: Exclude<CareerCompetencyTier, "specialized">;
};

const DEFAULT_RECOMMENDATION_LIMIT = 3;

function isActionableCompetency(
  competency: CompetencyReadiness,
): competency is ActionableCompetency {
  return (
    competency.tier !== "specialized" &&
    competency.evidenceStatus !== "demonstrated"
  );
}

function getPriorityTier(competency: ActionableCompetency): number {
  if (
    competency.tier === "core" &&
    competency.evidenceStatus === "missing"
  ) {
    return 0;
  }

  if (
    competency.tier === "core" &&
    competency.evidenceStatus === "developing"
  ) {
    return 1;
  }

  if (
    competency.tier === "common" &&
    competency.evidenceStatus === "missing"
  ) {
    return 2;
  }

  return 3;
}

function getPriorityLevel(
  competency: ActionableCompetency,
): RecommendationPriorityLevel {
  if (
    competency.tier === "core" &&
    competency.evidenceStatus === "missing"
  ) {
    return "critical";
  }

  if (competency.tier === "core") {
    return "high";
  }

  if (competency.evidenceStatus === "missing") {
    return "medium";
  }

  return "low";
}

function getActionType(status: ActionableStatus): RecommendationActionType {
  return status === "missing"
    ? "create-evidence"
    : "strengthen-evidence";
}

function getTitle(competency: ActionableCompetency): string {
  if (competency.evidenceStatus === "missing") {
    return `Build evidence for ${competency.competencyName}`;
  }

  return `Strengthen your ${competency.competencyName} evidence`;
}

function getAction(competency: ActionableCompetency): string {
  if (competency.evidenceStatus === "missing") {
    return [
      "Complete a focused course or project that demonstrates",
      `${competency.competencyName}, then document the finished`,
      "outcome as evidence.",
    ].join(" ");
  }

  return [
    "Finish or extend an existing activity that supports",
    `${competency.competencyName}, then document what you`,
    "built, decided, or measured.",
  ].join(" ");
}

function getReason(competency: ActionableCompetency): string {
  const evidenceExplanation =
    competency.evidenceStatus === "missing"
      ? "has no supporting evidence yet"
      : "currently has only developing or partial evidence";

  const tierLabel =
    competency.tier === "core"
      ? "a core competency for this career type"
      : "a common competency that is frequently valuable across this career type";

  return [
    `${competency.competencyName} is ${tierLabel}`,
    `and ${evidenceExplanation}.`,
  ].join(" ");
}

function compareCompetencies(
  left: ActionableCompetency,
  right: ActionableCompetency,
  scoreIncreaseById: Map<string, number>,
): number {
  const priorityDifference =
    getPriorityTier(left) - getPriorityTier(right);

  if (priorityDifference !== 0) {
    return priorityDifference;
  }

  const impactDifference =
    (scoreIncreaseById.get(right.competencyId) ?? 0) -
    (scoreIncreaseById.get(left.competencyId) ?? 0);

  if (impactDifference !== 0) {
    return impactDifference;
  }

  return left.competencyName.localeCompare(right.competencyName);
}

export function generateRecommendations({
  profile,
  role,
  limit,
}: GenerateRecommendationsOptions & {
  profile: StudentProfile;
  role: CareerRole;
}): NextMoveRecommendation[] {
  const assessment = calculateReadiness(profile, role);
  const resolvedLimit = Math.max(
    0,
    Math.floor(limit ?? DEFAULT_RECOMMENDATION_LIMIT),
  );

  const actionable = assessment.competencies.filter(
    isActionableCompetency,
  );

  const scoreIncreaseById = new Map<string, number>();
  const suggestedById = new Map<string, string[]>();

  for (const competency of actionable) {
    const definition = getCompetencyDefinition(competency.competencyId);
    const suggestedEvidenceSkillIds = suggestEvidenceSkillIds(
      definition,
      competency.groups,
    );

    suggestedById.set(competency.competencyId, suggestedEvidenceSkillIds);

    if (suggestedEvidenceSkillIds.length === 0) {
      scoreIncreaseById.set(competency.competencyId, 0);
      continue;
    }

    const projectedProfile = applyEvidencePackageToProfile(profile, {
      idSuffix: competency.competencyId,
      title: getTitle(competency),
      description: getAction(competency),
      skillIds: suggestedEvidenceSkillIds,
    });

    const projectedAssessment = calculateReadiness(
      projectedProfile,
      role,
    );

    scoreIncreaseById.set(
      competency.competencyId,
      Math.max(0, projectedAssessment.score - assessment.score),
    );
  }

  return actionable
    .sort((left, right) =>
      compareCompetencies(left, right, scoreIncreaseById),
    )
    .slice(0, resolvedLimit)
    .map((competency, index) => {
      return {
        id: [
          "recommendation",
          competency.competencyId,
          competency.evidenceStatus,
        ].join("-"),
        priority: index + 1,
        priorityLevel: getPriorityLevel(competency),
        competencyId: competency.competencyId,
        competencyName: competency.competencyName,
        tier: competency.tier,
        suggestedEvidenceSkillIds:
          suggestedById.get(competency.competencyId) ?? [],
        currentStatus: competency.evidenceStatus,
        targetStatus: "demonstrated",
        actionType: getActionType(competency.evidenceStatus),
        title: getTitle(competency),
        action: getAction(competency),
        reason: getReason(competency),
        estimatedScoreIncrease:
          scoreIncreaseById.get(competency.competencyId) ?? 0,
      };
    });
}
