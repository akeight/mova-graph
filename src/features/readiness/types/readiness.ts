import type { CareerCompetencyTier } from "@/features/goals/types/career-role";
import type { GroupEvaluation, EvidenceMatch } from "../services/evaluate-competency-evidence";

export type EvidenceStatus =
  | "demonstrated"
  | "developing"
  | "missing";

export type DisplayStatus =
  | "demonstrated"
  | "developing"
  | "missing"
  | "not-explored";

export type CompetencyReadiness = {
  competencyId: string;
  competencyName: string;
  description: string;
  tier: CareerCompetencyTier;
  specializationGroup?: string;
  evidenceStatus: EvidenceStatus;
  displayStatus: DisplayStatus;
  competencyCredit: number;
  groups: GroupEvaluation[];
  matchedEvidence: EvidenceMatch[];
};

export type TierSummary = {
  demonstratedCount: number;
  developingCount: number;
  missingCount: number;
  notExploredCount: number;
  total: number;
  coverage: number;
};

export type ReadinessAssessment = {
  score: number;
  coreCoverage: number;
  commonCoverage: number;
  demonstratedCount: number;
  developingCount: number;
  missingCount: number;
  totalCompetencies: number;
  competencies: CompetencyReadiness[];
  core: TierSummary;
  common: TierSummary;
  specialized: TierSummary;
};

export const CORE_SCORE_WEIGHT = 0.6;
export const COMMON_SCORE_WEIGHT = 0.4;
