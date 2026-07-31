import type { CareerRole } from "@/features/goals/types/career-role";
import { calculateReadiness } from "@/features/readiness/services/calculate-readiness";
import type { RequirementReadiness } from "@/features/readiness/types/readiness";
import type { NextMoveRecommendation } from "@/features/recommendations/types/recommendation";
import type {
  StudentExperience,
  StudentProfile,
} from "@/features/student-profile/types/student-profile";

import type { RecommendationScenarioResult } from "../types/scenario";

const SCENARIO_EXPERIENCE_PREFIX =
  "scenario-experience";

function createScenarioExperience(
  recommendation: NextMoveRecommendation,
): StudentExperience {
  return {
    id: [
      SCENARIO_EXPERIENCE_PREFIX,
      recommendation.skillId,
    ].join("-"),

    title: recommendation.title,
    description: recommendation.action,
    status: "completed",
    skillIds: [recommendation.skillId],
  };
}

function cloneProfile(
  profile: StudentProfile,
): StudentProfile {
  return {
    ...profile,

    courses: profile.courses.map((course) => ({
      ...course,
      skillIds: [...course.skillIds],
    })),

    experiences: profile.experiences.map(
      (experience) => ({
        ...experience,
        skillIds: [...experience.skillIds],
      }),
    ),

    skills: profile.skills.map((skill) => ({
      ...skill,
    })),
  };
}

function getRequirement(
  requirements: RequirementReadiness[],
  skillId: string,
): RequirementReadiness {
  const requirement = requirements.find(
    (currentRequirement) =>
      currentRequirement.skillId === skillId,
  );

  if (!requirement) {
    throw new Error(
      `Cannot simulate a recommendation for unknown role skill "${skillId}".`,
    );
  }

  return requirement;
}

export function applyRecommendationToProfile(
  profile: StudentProfile,
  recommendation: NextMoveRecommendation,
): StudentProfile {
  const projectedProfile = cloneProfile(profile);

  const scenarioExperience =
    createScenarioExperience(recommendation);

  const existingExperiencesWithoutScenario =
    projectedProfile.experiences.filter(
      (experience) =>
        experience.id !== scenarioExperience.id,
    );

  return {
    ...projectedProfile,

    experiences: [
      ...existingExperiencesWithoutScenario,
      scenarioExperience,
    ],
  };
}

export function simulateRecommendation(
  profile: StudentProfile,
  role: CareerRole,
  recommendation: NextMoveRecommendation,
): RecommendationScenarioResult {
  const baselineAssessment =
    calculateReadiness(profile, role);

  const baselineRequirement = getRequirement(
    baselineAssessment.requirements,
    recommendation.skillId,
  );

  const projectedProfile =
    applyRecommendationToProfile(
      profile,
      recommendation,
    );

  const projectedAssessment =
    calculateReadiness(
      projectedProfile,
      role,
    );

  const projectedRequirement = getRequirement(
    projectedAssessment.requirements,
    recommendation.skillId,
  );

  return {
    id: [
      "scenario",
      role.id,
      recommendation.id,
    ].join("-"),

    recommendation,
    projectedProfile,

    baselineAssessment,
    projectedAssessment,

    scoreBefore: baselineAssessment.score,
    scoreAfter: projectedAssessment.score,

    scoreIncrease: Math.max(
      0,
      projectedAssessment.score -
        baselineAssessment.score,
    ),

    statusChange: {
      skillId: recommendation.skillId,
      skillName: recommendation.skillName,
      before: baselineRequirement.status,
      after: projectedRequirement.status,
    },
  };
}