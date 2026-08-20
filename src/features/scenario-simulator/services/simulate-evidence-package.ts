import type { CareerRole } from "@/features/goals/types/career-role";
import { calculateReadiness } from "@/features/readiness/services/calculate-readiness";
import type { ReadinessAssessment } from "@/features/readiness/types/readiness";
import { applyEvidencePackageToProfile } from "@/features/student-profile/services/apply-evidence-package";
import type { StudentProfile } from "@/features/student-profile/types/student-profile";

export type EvidencePackageOptions = {
  idSuffix: string;
  title: string;
  description: string;
  skillIds: string[];
};

export type EvidencePackageScenarioResult = {
  projectedProfile: StudentProfile;
  baselineAssessment: ReadinessAssessment;
  projectedAssessment: ReadinessAssessment;
  scoreBefore: number;
  scoreAfter: number;
  scoreIncrease: number;
};

export function simulateEvidencePackage(
  profile: StudentProfile,
  role: CareerRole,
  options: EvidencePackageOptions,
): EvidencePackageScenarioResult {
  const baselineAssessment = calculateReadiness(profile, role);
  const projectedProfile = applyEvidencePackageToProfile(
    profile,
    options,
  );
  const projectedAssessment = calculateReadiness(
    projectedProfile,
    role,
  );

  if (projectedAssessment.score < baselineAssessment.score) {
    throw new Error(
      "Adding completed evidence must not reduce career readiness.",
    );
  }

  return {
    projectedProfile,
    baselineAssessment,
    projectedAssessment,
    scoreBefore: baselineAssessment.score,
    scoreAfter: projectedAssessment.score,
    scoreIncrease:
      projectedAssessment.score - baselineAssessment.score,
  };
}
