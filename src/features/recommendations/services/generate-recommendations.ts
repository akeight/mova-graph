import type {
    ReadinessAssessment,
    ReadinessStatus,
    RequirementReadiness,
  } from "@/features/readiness/types/readiness";
  
  import type {
    GenerateRecommendationsOptions,
    NextMoveRecommendation,
    RecommendationActionType,
    RecommendationPriorityLevel,
  } from "../types/recommendation";
  
  type ActionableStatus = Exclude<
    ReadinessStatus,
    "demonstrated"
  >;
  
  type ActionableRequirement =
    RequirementReadiness & {
      status: ActionableStatus;
    };
  
  const DEFAULT_RECOMMENDATION_LIMIT = 3;
  
  function isActionableRequirement(
    requirement: RequirementReadiness,
  ): requirement is ActionableRequirement {
    return requirement.status !== "demonstrated";
  }
  
  function getPriorityTier(
    requirement: ActionableRequirement,
  ): number {
    if (
      requirement.importance === "required" &&
      requirement.status === "missing"
    ) {
      return 0;
    }
  
    if (
      requirement.importance === "required" &&
      requirement.status === "developing"
    ) {
      return 1;
    }
  
    if (
      requirement.importance === "preferred" &&
      requirement.status === "missing"
    ) {
      return 2;
    }
  
    return 3;
  }
  
  function getPriorityLevel(
    requirement: ActionableRequirement,
  ): RecommendationPriorityLevel {
    if (
      requirement.importance === "required" &&
      requirement.status === "missing"
    ) {
      return "critical";
    }
  
    if (requirement.importance === "required") {
      return "high";
    }
  
    if (requirement.status === "missing") {
      return "medium";
    }
  
    return "low";
  }
  
  function getActionType(
    status: ActionableStatus,
  ): RecommendationActionType {
    return status === "missing"
      ? "create-evidence"
      : "strengthen-evidence";
  }
  
  function getTitle(
    requirement: ActionableRequirement,
  ): string {
    if (requirement.status === "missing") {
      return `Build evidence for ${requirement.skillName}`;
    }
  
    return `Strengthen your ${requirement.skillName} evidence`;
  }
  
  function getAction(
    requirement: ActionableRequirement,
  ): string {
    if (requirement.status === "missing") {
      return [
        "Complete a focused course or project that uses",
        `${requirement.skillName}, then document the finished`,
        "outcome as evidence.",
      ].join(" ");
    }
  
    return [
      "Finish or extend an existing activity that uses",
      `${requirement.skillName}, then document what you`,
      "built, decided, or measured.",
    ].join(" ");
  }
  
  function getReason(
    requirement: ActionableRequirement,
  ): string {
    const evidenceExplanation =
      requirement.status === "missing"
        ? "has no supporting evidence yet"
        : "currently has only developing evidence";
  
    return [
      `${requirement.skillName} is`,
      `${requirement.importance} for the selected role`,
      `and ${evidenceExplanation}.`,
    ].join(" ");
  }
  
  function calculateEstimatedScoreIncrease(
    requirement: ActionableRequirement,
    assessment: ReadinessAssessment,
  ): number {
    const possibleWeight =
      assessment.requirements.reduce(
        (total, currentRequirement) =>
          total + currentRequirement.weight,
        0,
      );
  
    if (possibleWeight === 0) {
      return 0;
    }
  
    const currentEarnedWeight =
      assessment.requirements.reduce(
        (total, currentRequirement) =>
          total + currentRequirement.earnedWeight,
        0,
      );
  
    const remainingSkillWeight =
      requirement.weight -
      requirement.earnedWeight;
  
    const projectedScore = Math.round(
      ((currentEarnedWeight +
        remainingSkillWeight) /
        possibleWeight) *
        100,
    );
  
    return Math.max(
      0,
      projectedScore - assessment.score,
    );
  }
  
  function compareRequirements(
    left: ActionableRequirement,
    right: ActionableRequirement,
  ): number {
    const priorityDifference =
      getPriorityTier(left) -
      getPriorityTier(right);
  
    if (priorityDifference !== 0) {
      return priorityDifference;
    }
  
    const leftGap =
      left.weight - left.earnedWeight;
    const rightGap =
      right.weight - right.earnedWeight;
  
    const impactDifference =
      rightGap - leftGap;
  
    if (impactDifference !== 0) {
      return impactDifference;
    }
  
    return left.skillName.localeCompare(
      right.skillName,
    );
  }
  
  function createRecommendation(
    requirement: ActionableRequirement,
    assessment: ReadinessAssessment,
    priority: number,
  ): NextMoveRecommendation {
    return {
      id: [
        "recommendation",
        requirement.skillId,
        requirement.status,
      ].join("-"),
  
      priority,
      priorityLevel:
        getPriorityLevel(requirement),
  
      skillId: requirement.skillId,
      skillName: requirement.skillName,
      importance: requirement.importance,
  
      currentStatus: requirement.status,
      targetStatus: "demonstrated",
  
      actionType:
        getActionType(requirement.status),
  
      title: getTitle(requirement),
      action: getAction(requirement),
      reason: getReason(requirement),
  
      estimatedScoreIncrease:
        calculateEstimatedScoreIncrease(
          requirement,
          assessment,
        ),
    };
  }
  
  export function generateRecommendations(
    assessment: ReadinessAssessment,
    options: GenerateRecommendationsOptions = {},
  ): NextMoveRecommendation[] {
    const limit = Math.max(
      0,
      Math.floor(
        options.limit ??
          DEFAULT_RECOMMENDATION_LIMIT,
      ),
    );
  
    return assessment.requirements
      .filter(isActionableRequirement)
      .sort(compareRequirements)
      .slice(0, limit)
      .map((requirement, index) =>
        createRecommendation(
          requirement,
          assessment,
          index + 1,
        ),
      );
  }