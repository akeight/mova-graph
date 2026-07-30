import type { SkillImportance } from "@/features/goals/types/career-role";
import type { ReadinessStatus } from "@/features/readiness/types/readiness";

export type RecommendationActionType =
  | "create-evidence"
  | "strengthen-evidence";

export type RecommendationPriorityLevel =
  | "critical"
  | "high"
  | "medium"
  | "low";

export type NextMoveRecommendation = {
  id: string;
  priority: number;
  priorityLevel: RecommendationPriorityLevel;

  skillId: string;
  skillName: string;
  importance: SkillImportance;

  currentStatus: Exclude<
    ReadinessStatus,
    "demonstrated"
  >;
  targetStatus: "demonstrated";

  actionType: RecommendationActionType;
  title: string;
  action: string;
  reason: string;

  estimatedScoreIncrease: number;
};

export type GenerateRecommendationsOptions = {
  limit?: number;
};