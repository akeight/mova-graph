import { describe, expect, it } from "vitest";

import { careerRoles, getCareerRole } from
  "@/features/goals/data/career-roles";
import { calculateReadiness } from
  "@/features/readiness/services/calculate-readiness";
import { generateRecommendations } from
  "@/features/recommendations/services/generate-recommendations";
import { buildOpportunityResult } from
  "@/features/opportunity-what-if/services/build-opportunity-result";
import { approvedSkillIdsFromSelection } from
  "@/features/skill-analysis/services/extracted-skill-review";

import { DEMO_OPPORTUNITY_EXTRACTION } from "./demo-opportunity";
import {
  DEMO_DEFAULT_CAREER_ROLE_ID,
  createExploredDemoProfile,
} from "./demo-resume";

describe("demo readiness and what-if", () => {
  const profile = createExploredDemoProfile();

  it("matches representative live Claude readiness for every career target", () => {
    const summaries = Object.fromEntries(
      careerRoles.map((role) => {
        const assessment = calculateReadiness(profile, role);
        const recommendations = generateRecommendations({ profile, role });

        return [
          role.id,
          {
            score: assessment.score,
            topRecommendation: recommendations[0]?.title ?? null,
          },
        ];
      }),
    );

    expect(summaries).toMatchObject({
      "product-engineer": { score: 33 },
      "frontend-engineer": { score: 30 },
      "mobile-engineer": { score: 40 },
      "full-stack-engineer": { score: 47 },
    });
    expect(DEMO_DEFAULT_CAREER_ROLE_ID).toBe("full-stack-engineer");
  });

  it("projects Full-Stack What If with the real scenario engine", () => {
    const role = getCareerRole("full-stack-engineer");
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

    expect(skillIds).toEqual(
      expect.arrayContaining(["deployment"]),
    );
    expect(result.scoreBefore).toBe(47);
    expect(result.scoreAfter).toBe(60);
    expect(result.scoreIncrease).toBe(13);
    expect(result.explanation.strengthenedCompetencyNames).toEqual([
      "Production Delivery",
    ]);
  });
});
