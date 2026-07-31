import type {
    ReadinessAssessment,
    ReadinessStatus,
  } from "@/features/readiness/types/readiness";
  import type { NextMoveRecommendation } from "@/features/recommendations/types/recommendation";
  import type { StudentProfile } from "@/features/student-profile/types/student-profile";
  
  export type ScenarioStatusChange = {
    skillId: string;
    skillName: string;
    before: ReadinessStatus;
    after: ReadinessStatus;
  };
  
  export type RecommendationScenarioResult = {
    id: string;
    recommendation: NextMoveRecommendation;
  
    projectedProfile: StudentProfile;
  
    baselineAssessment: ReadinessAssessment;
    projectedAssessment: ReadinessAssessment;
  
    scoreBefore: number;
    scoreAfter: number;
    scoreIncrease: number;
  
    statusChange: ScenarioStatusChange;
  };