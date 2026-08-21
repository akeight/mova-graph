import { describe, expect, it } from "vitest";

import { careerRoles } from "@/features/goals/data/career-roles";
import { calculateReadiness } from
  "@/features/readiness/services/calculate-readiness";
import { generateRecommendations } from
  "@/features/recommendations/services/generate-recommendations";
import { buildOpportunityResult } from
  "@/features/opportunity-what-if/services/build-opportunity-result";
import { approvedSkillIdsFromSelection } from
  "@/features/skill-analysis/services/extracted-skill-review";

import { DEMO_OPPORTUNITY_EXTRACTION } from "./demo-opportunity";
import { createExploredDemoProfile } from "./demo-resume";

describe("demo readiness and what-if", () => {
  const profile = createExploredDemoProfile();

  it("scores every current career target without changing readiness logic", () => {
    const summaries = careerRoles.map((role) => {
      const assessment = calculateReadiness(profile, role);
      const recommendations = generateRecommendations({ profile, role });
      const core = assessment.competencies.filter(
        (competency) => competency.tier === "core",
      );
      const common = assessment.competencies.filter(
        (competency) => competency.tier === "common",
      );

      return {
        roleId: role.id,
        title: role.title,
        score: assessment.score,
        core: core.map((competency) => ({
          id: competency.competencyId,
          status: competency.evidenceStatus,
          credit: competency.competencyCredit,
        })),
        common: common.map((competency) => ({
          id: competency.competencyId,
          status: competency.evidenceStatus,
          credit: competency.competencyCredit,
        })),
        topGaps: [...core, ...common]
          .filter((competency) => competency.evidenceStatus !== "demonstrated")
          .slice(0, 4)
          .map((competency) => competency.competencyName),
        topRecommendation: recommendations[0]?.title ?? null,
      };
    });

    expect(summaries).toHaveLength(4);
    expect(summaries.every((summary) => Number.isInteger(summary.score))).toBe(
      true,
    );
  });

  it("projects What If scores with the real scenario engine", () => {
    const role = careerRoles[0];
    const skillIds = approvedSkillIdsFromSelection(
      DEMO_OPPORTUNITY_EXTRACTION.skills,
      DEMO_OPPORTUNITY_EXTRACTION.skills
        .filter((skill) => skill.provenance !== "derived")
        .map((skill) => skill.id),
    );
    const result = buildOpportunityResult({
      opportunityType: DEMO_OPPORTUNITY_EXTRACTION.opportunityType,
      title: DEMO_OPPORTUNITY_EXTRACTION.title,
      description: DEMO_OPPORTUNITY_EXTRACTION.description,
      profile,
      role,
      skillIds,
    });

    expect(result.scoreAfter).toBeGreaterThanOrEqual(result.scoreBefore);
    expect(result.projectedAssessment.score).toBe(result.scoreAfter);
  });
});
