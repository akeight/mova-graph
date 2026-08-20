import type { CareerRole } from "@/features/goals/types/career-role";
import {
  getEvidenceSkill,
  getEvidenceSkillName,
} from "@/features/goals/data/evidence-skills";
import type { CompetencyReadiness } from "@/features/readiness/types/readiness";
import { simulateEvidencePackage } from
  "@/features/scenario-simulator/services/simulate-evidence-package";
import { reconcileProfileSkills } from
  "@/features/student-profile/utils/reconcile-profile-skills";
import type { StudentProfile } from
  "@/features/student-profile/types/student-profile";

import {
  MAX_REMAINING_GAPS,
  OPPORTUNITY_PACKAGE_ID_SUFFIX,
  OPPORTUNITY_TYPE_LABELS,
} from "../constants";
import type {
  CompetencyImpact,
  OpportunitySimulationResult,
  OpportunityType,
  RemainingGap,
  ZeroDeltaReason,
} from "../types/opportunity-what-if";

function tierRank(tier: CompetencyReadiness["tier"]): number {
  return tier === "core" ? 0 : 1;
}

export function diffCompetencyImpacts(
  baseline: CompetencyReadiness[],
  projected: CompetencyReadiness[],
): CompetencyImpact[] {
  return projected.flatMap((after) => {
    const before = baseline.find(
      (competency) => competency.competencyId === after.competencyId,
    );

    if (!before || after.competencyCredit <= before.competencyCredit) {
      return [];
    }

    return [
      {
        competencyId: after.competencyId,
        competencyName: after.competencyName,
        tier: after.tier,
        creditBefore: before.competencyCredit,
        creditAfter: after.competencyCredit,
      },
    ];
  });
}

export function selectRemainingGaps(
  competencies: CompetencyReadiness[],
  limit = MAX_REMAINING_GAPS,
): RemainingGap[] {
  return competencies
    .filter(
      (competency) =>
        competency.tier !== "specialized" &&
        competency.evidenceStatus !== "demonstrated",
    )
    .sort((left, right) => {
      const leftTier = tierRank(left.tier);
      const rightTier = tierRank(right.tier);

      if (leftTier !== rightTier) {
        return leftTier - rightTier;
      }

      if (left.competencyCredit !== right.competencyCredit) {
        return left.competencyCredit - right.competencyCredit;
      }

      return left.competencyName.localeCompare(right.competencyName);
    })
    .slice(0, limit)
    .map((competency) => ({
      competencyId: competency.competencyId,
      competencyName: competency.competencyName,
      displayStatus: competency.displayStatus,
    }));
}

export function catalogEvidenceNames(skillIds: string[]): string[] {
  const names: string[] = [];
  const seen = new Set<string>();

  for (const skillId of skillIds) {
    if (!getEvidenceSkill(skillId) || seen.has(skillId)) {
      continue;
    }

    seen.add(skillId);
    names.push(getEvidenceSkillName(skillId));
  }

  return names;
}

function scoredCreditIncreased(impacts: CompetencyImpact[]): boolean {
  return impacts.some((impact) => impact.tier !== "specialized");
}

function specializedCreditIncreased(impacts: CompetencyImpact[]): boolean {
  return impacts.some((impact) => impact.tier === "specialized");
}

function approvedSkillsAlreadyDemonstrated(
  profile: StudentProfile,
  skillIds: string[],
): boolean {
  const catalogIds = skillIds.filter((skillId) => getEvidenceSkill(skillId));

  if (catalogIds.length === 0) {
    return false;
  }

  const reconciled = reconcileProfileSkills(profile);
  const statusById = new Map(
    reconciled.skills.map((skill) => [skill.id, skill.status]),
  );

  return catalogIds.every(
    (skillId) => statusById.get(skillId) === "demonstrated",
  );
}

export function resolveZeroDeltaReason(options: {
  scoreBefore: number;
  scoreAfter: number;
  impacts: CompetencyImpact[];
  profile: StudentProfile;
  skillIds: string[];
}): ZeroDeltaReason | null {
  if (options.scoreAfter !== options.scoreBefore) {
    return null;
  }

  if (scoredCreditIncreased(options.impacts)) {
    return "scored-progress-no-rounded-delta";
  }

  if (specializedCreditIncreased(options.impacts)) {
    return "specialized-only";
  }

  if (approvedSkillsAlreadyDemonstrated(options.profile, options.skillIds)) {
    return "already-demonstrated";
  }

  return "unscored-or-full-groups";
}

export function formatOpportunityImpactCopy(options: {
  opportunityType: OpportunityType;
  roleTitle: string;
  addedEvidenceNames: string[];
  strengthenedCompetencyNames: string[];
  zeroDeltaReason: ZeroDeltaReason | null;
}): string {
  const typeLabel = OPPORTUNITY_TYPE_LABELS[options.opportunityType];

  if (options.zeroDeltaReason === "scored-progress-no-rounded-delta") {
    return "This would strengthen some of your career competencies, but the improvement isn't large enough to change your rounded overall readiness score yet.";
  }

  if (options.zeroDeltaReason) {
    if (options.zeroDeltaReason === "already-demonstrated") {
      return `This opportunity adds useful experience, but it doesn't currently change your ${options.roleTitle} readiness score because you already demonstrate this evidence.`;
    }

    if (options.zeroDeltaReason === "specialized-only") {
      return `This opportunity adds useful experience, but it doesn't currently change your ${options.roleTitle} readiness score because it maps only to specialized exploration.`;
    }

    return `This opportunity adds useful experience, but it doesn't currently change your ${options.roleTitle} readiness score because it doesn't currently address scored competencies.`;
  }

  const evidence =
    options.addedEvidenceNames.length > 0
      ? options.addedEvidenceNames.join(", ")
      : "the selected evidence";
  const competencies =
    options.strengthenedCompetencyNames.length > 0
      ? options.strengthenedCompetencyNames.join(", ")
      : "career competencies";

  return `If completed, this ${typeLabel} adds evidence in ${evidence}, which strengthen ${competencies} in your ${options.roleTitle} model.`;
}

export function buildOpportunityResult(options: {
  opportunityType: OpportunityType;
  title: string;
  description: string;
  profile: StudentProfile;
  role: CareerRole;
  skillIds: string[];
}): OpportunitySimulationResult {
  const simulated = simulateEvidencePackage(options.profile, options.role, {
    idSuffix: OPPORTUNITY_PACKAGE_ID_SUFFIX,
    title: options.title,
    description: options.description,
    skillIds: options.skillIds,
  });
  const strengthenedCompetencies = diffCompetencyImpacts(
    simulated.baselineAssessment.competencies,
    simulated.projectedAssessment.competencies,
  );
  const remainingGaps = selectRemainingGaps(
    simulated.projectedAssessment.competencies,
  );
  const addedEvidenceNames = catalogEvidenceNames(options.skillIds);
  const strengthenedCompetencyNames = strengthenedCompetencies.map(
    (impact) => impact.competencyName,
  );
  const zeroDeltaReason = resolveZeroDeltaReason({
    scoreBefore: simulated.scoreBefore,
    scoreAfter: simulated.scoreAfter,
    impacts: strengthenedCompetencies,
    profile: options.profile,
    skillIds: options.skillIds,
  });

  return {
    opportunityType: options.opportunityType,
    title: options.title,
    projectedProfile: simulated.projectedProfile,
    baselineAssessment: simulated.baselineAssessment,
    projectedAssessment: simulated.projectedAssessment,
    scoreBefore: simulated.scoreBefore,
    scoreAfter: simulated.scoreAfter,
    scoreIncrease: simulated.scoreIncrease,
    strengthenedCompetencies,
    remainingGaps,
    explanation: {
      addedEvidenceNames,
      strengthenedCompetencyNames,
      zeroDeltaReason,
    },
  };
}
