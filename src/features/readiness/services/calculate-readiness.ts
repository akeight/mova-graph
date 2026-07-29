import type {
    CareerRole,
    SkillImportance,
  } from "@/features/goals/types/career-role";
  import type {
    StudentProfile,
    StudentSkill,
  } from "@/features/student-profile/types/student-profile";
  import { reconcileProfileSkills } from
    "@/features/student-profile/utils/reconcile-profile-skills";
  
  import type {
    ReadinessAssessment,
    ReadinessStatus,
    RequirementReadiness,
  } from "../types/readiness";
  
  const IMPORTANCE_WEIGHTS: Record<
    SkillImportance,
    number
  > = {
    required: 2,
    preferred: 1,
  };
  
  const STATUS_CREDIT: Record<
    ReadinessStatus,
    number
  > = {
    demonstrated: 1,
    developing: 0.5,
    missing: 0,
  };
  
  function getReadinessStatus(
    skill?: StudentSkill,
  ): ReadinessStatus {
    if (!skill) {
      return "missing";
    }
  
    return skill.status;
  }
  
  export function calculateReadiness(
    profile: StudentProfile,
    role: CareerRole,
  ): ReadinessAssessment {
    const reconciledProfile =
      reconcileProfileSkills(profile);
  
    const studentSkillMap = new Map(
      reconciledProfile.skills.map((skill) => [
        skill.id,
        skill,
      ]),
    );
  
    const requirements: RequirementReadiness[] =
      role.requirements.map((requirement) => {
        const studentSkill = studentSkillMap.get(
          requirement.skillId,
        );
  
        const status =
          getReadinessStatus(studentSkill);
  
        const weight =
          IMPORTANCE_WEIGHTS[
            requirement.importance
          ];
  
        const earnedWeight =
          weight * STATUS_CREDIT[status];
  
        return {
          skillId: requirement.skillId,
          skillName: requirement.skillName,
          importance: requirement.importance,
          status,
          weight,
          earnedWeight,
        };
      });
  
    const possibleWeight = requirements.reduce(
      (total, requirement) =>
        total + requirement.weight,
      0,
    );
  
    const earnedWeight = requirements.reduce(
      (total, requirement) =>
        total + requirement.earnedWeight,
      0,
    );
  
    const score =
      possibleWeight === 0
        ? 0
        : Math.round(
            (earnedWeight / possibleWeight) * 100,
          );
  
    return {
      score,
      demonstratedCount: requirements.filter(
        (requirement) =>
          requirement.status === "demonstrated",
      ).length,
      developingCount: requirements.filter(
        (requirement) =>
          requirement.status === "developing",
      ).length,
      missingCount: requirements.filter(
        (requirement) =>
          requirement.status === "missing",
      ).length,
      totalRequirements: requirements.length,
      requirements,
    };
  }