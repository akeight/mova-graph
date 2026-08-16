import type { CareerRole } from "@/features/goals/types/career-role";
import { resolveRoleCompetencies } from "@/features/goals/data/career-roles";
import type { StudentProfile } from "@/features/student-profile/types/student-profile";
import { reconcileProfileSkills } from "@/features/student-profile/utils/reconcile-profile-skills";

import { evaluateCompetencyEvidence } from "./evaluate-competency-evidence";
import {
  COMMON_SCORE_WEIGHT,
  CORE_SCORE_WEIGHT,
  type CompetencyReadiness,
  type DisplayStatus,
  type ReadinessAssessment,
  type TierSummary,
} from "../types/readiness";

/*
 * Career readiness is weighted competency coverage from evidence in the
 * MOVa profile. It is not probability of employment, a claim that every
 * employer requires the same stack, or opportunity fit (years of
 * experience, clearance, location, degrees, employer-specific tools).
 *
 * General score uses core and common only:
 *   coreCoverage = mean(core competencyCredit)
 *   commonCoverage = mean(common competencyCredit)
 *   score = round((coreCoverage * 0.60 + commonCoverage * 0.40) * 100)
 *
 * Specialized competencies are evaluated and shown as optional focus
 * areas. They do not enter the general readiness denominator.
 */

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return (
    values.reduce((total, value) => total + value, 0) / values.length
  );
}

function summarizeTier(
  competencies: CompetencyReadiness[],
): TierSummary {
  return {
    demonstratedCount: competencies.filter(
      (competency) => competency.displayStatus === "demonstrated",
    ).length,
    developingCount: competencies.filter(
      (competency) => competency.displayStatus === "developing",
    ).length,
    missingCount: competencies.filter(
      (competency) => competency.displayStatus === "missing",
    ).length,
    notExploredCount: competencies.filter(
      (competency) => competency.displayStatus === "not-explored",
    ).length,
    total: competencies.length,
    coverage: average(
      competencies.map((competency) => competency.competencyCredit),
    ),
  };
}

export function calculateReadiness(
  profile: StudentProfile,
  role: CareerRole,
): ReadinessAssessment {
  const reconciledProfile = reconcileProfileSkills(profile);

  const competencies: CompetencyReadiness[] = resolveRoleCompetencies(
    role,
  ).map(({ assignment, definition }) => {
    const evaluation = evaluateCompetencyEvidence(
      definition,
      reconciledProfile.skills,
    );

    const displayStatus: DisplayStatus =
      assignment.tier === "specialized" &&
      evaluation.evidenceStatus === "missing"
        ? "not-explored"
        : evaluation.evidenceStatus;

    return {
      competencyId: definition.id,
      competencyName: definition.name,
      description: definition.description,
      tier: assignment.tier,
      specializationGroup: assignment.specializationGroup,
      evidenceStatus: evaluation.evidenceStatus,
      displayStatus,
      competencyCredit: evaluation.competencyCredit,
      groups: evaluation.groups,
      matchedEvidence: evaluation.matchedEvidence,
    };
  });

  const core = competencies.filter(
    (competency) => competency.tier === "core",
  );
  const common = competencies.filter(
    (competency) => competency.tier === "common",
  );
  const specialized = competencies.filter(
    (competency) => competency.tier === "specialized",
  );
  const general = [...core, ...common];

  const coreSummary = summarizeTier(core);
  const commonSummary = summarizeTier(common);

  const score = Math.round(
    (coreSummary.coverage * CORE_SCORE_WEIGHT +
      commonSummary.coverage * COMMON_SCORE_WEIGHT) *
      100,
  );

  return {
    score,
    coreCoverage: coreSummary.coverage,
    commonCoverage: commonSummary.coverage,
    demonstratedCount: general.filter(
      (competency) => competency.evidenceStatus === "demonstrated",
    ).length,
    developingCount: general.filter(
      (competency) => competency.evidenceStatus === "developing",
    ).length,
    missingCount: general.filter(
      (competency) => competency.evidenceStatus === "missing",
    ).length,
    totalCompetencies: general.length,
    competencies,
    core: coreSummary,
    common: commonSummary,
    specialized: summarizeTier(specialized),
  };
}
