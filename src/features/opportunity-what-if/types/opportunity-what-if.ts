import type { CareerCompetencyTier } from "@/features/goals/types/career-role";
import type {
  DisplayStatus,
  ReadinessAssessment,
} from "@/features/readiness/types/readiness";
import type { ExtractedSkill } from
  "@/features/skill-analysis/types/profile-item-extraction";
import type { StudentProfile } from
  "@/features/student-profile/types/student-profile";

export const opportunityTypes = [
  "internship",
  "course",
  "certification",
  "project",
  "other",
] as const;

export type OpportunityType = (typeof opportunityTypes)[number];

export type OpportunityClaimContext =
  | "developable"
  | "prerequisite";

export type OpportunityExtractionInput = {
  opportunityType: OpportunityType;
  text: string;
};

export type OpportunityExtraction = {
  opportunityType: OpportunityType;
  title: string;
  description: string;
  skills: ExtractedSkill[];
};

export type OpportunityEvidenceDraft = OpportunityExtraction & {
  selectedSkillIds: string[];
};

export type CompetencyImpact = {
  competencyId: string;
  competencyName: string;
  tier: CareerCompetencyTier;
  creditBefore: number;
  creditAfter: number;
};

export type RemainingGap = {
  competencyId: string;
  competencyName: string;
  displayStatus: DisplayStatus;
};

export type ZeroDeltaReason =
  | "already-demonstrated"
  | "specialized-only"
  | "unscored-or-full-groups"
  | "scored-progress-no-rounded-delta";

export type OpportunityExplanation = {
  addedEvidenceNames: string[];
  strengthenedCompetencyNames: string[];
  zeroDeltaReason: ZeroDeltaReason | null;
};

export type OpportunitySimulationResult = {
  opportunityType: OpportunityType;
  title: string;
  projectedProfile: StudentProfile;
  baselineAssessment: ReadinessAssessment;
  projectedAssessment: ReadinessAssessment;
  scoreBefore: number;
  scoreAfter: number;
  scoreIncrease: number;
  strengthenedCompetencies: CompetencyImpact[];
  remainingGaps: RemainingGap[];
  explanation: OpportunityExplanation;
};

export type OpportunityWhatIfStage =
  | "input"
  | "analyzing"
  | "review"
  | "impact";
