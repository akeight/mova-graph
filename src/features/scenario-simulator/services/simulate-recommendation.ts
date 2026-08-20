import type { CareerRole } from "@/features/goals/types/career-role";
import type { CompetencyReadiness } from "@/features/readiness/types/readiness";
import type { NextMoveRecommendation } from "@/features/recommendations/types/recommendation";
import { applyEvidencePackageToProfile } from "@/features/student-profile/services/apply-evidence-package";
import type { StudentProfile } from "@/features/student-profile/types/student-profile";

import type { RecommendationScenarioResult } from "../types/scenario";
import { simulateEvidencePackage } from "./simulate-evidence-package";

function getCompetency(
  competencies: CompetencyReadiness[],
  competencyId: string,
): CompetencyReadiness {
  const competency = competencies.find(
    (current) => current.competencyId === competencyId,
  );

  if (!competency) {
    throw new Error(
      `Cannot simulate a recommendation for unknown role competency "${competencyId}".`,
    );
  }

  return competency;
}

export function applyRecommendationToProfile(
  profile: StudentProfile,
  recommendation: NextMoveRecommendation,
): StudentProfile {
  return applyEvidencePackageToProfile(profile, {
    idSuffix: recommendation.competencyId,
    title: recommendation.title,
    description: recommendation.action,
    skillIds: recommendation.suggestedEvidenceSkillIds,
  });
}

export function simulateRecommendation(
  profile: StudentProfile,
  role: CareerRole,
  recommendation: NextMoveRecommendation,
): RecommendationScenarioResult {
  const simulated = simulateEvidencePackage(profile, role, {
    idSuffix: recommendation.competencyId,
    title: recommendation.title,
    description: recommendation.action,
    skillIds: recommendation.suggestedEvidenceSkillIds,
  });
  const baselineCompetency = getCompetency(
    simulated.baselineAssessment.competencies,
    recommendation.competencyId,
  );
  const projectedCompetency = getCompetency(
    simulated.projectedAssessment.competencies,
    recommendation.competencyId,
  );

  return {
    id: ["scenario", role.id, recommendation.id].join("-"),
    recommendation,
    projectedProfile: simulated.projectedProfile,
    baselineAssessment: simulated.baselineAssessment,
    projectedAssessment: simulated.projectedAssessment,
    scoreBefore: simulated.scoreBefore,
    scoreAfter: simulated.scoreAfter,
    scoreIncrease: Math.max(0, simulated.scoreIncrease),
    statusChange: {
      competencyId: recommendation.competencyId,
      competencyName: recommendation.competencyName,
      before: baselineCompetency.evidenceStatus,
      after: projectedCompetency.evidenceStatus,
    },
  };
}
