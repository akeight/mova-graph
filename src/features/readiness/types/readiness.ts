import type {
    SkillImportance,
  } from "@/features/goals/types/career-role";
  
  export type ReadinessStatus =
    | "demonstrated"
    | "developing"
    | "missing";
  
  export type RequirementReadiness = {
    skillId: string;
    skillName: string;
    importance: SkillImportance;
    status: ReadinessStatus;
    weight: number;
    earnedWeight: number;
  };
  
  export type ReadinessAssessment = {
    score: number;
    demonstratedCount: number;
    developingCount: number;
    missingCount: number;
    totalRequirements: number;
    requirements: RequirementReadiness[];
  };