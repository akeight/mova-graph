import type { CareerCompetencyTier } from "@/features/goals/types/career-role";
import type { EvidenceStatus } from "@/features/readiness/types/readiness";

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
  competencyId: string;
  competencyName: string;
  tier: Exclude<CareerCompetencyTier, "specialized">;
  suggestedEvidenceSkillIds: string[];
  currentStatus: Exclude<EvidenceStatus, "demonstrated">;
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
