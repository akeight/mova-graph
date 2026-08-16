import { describe, expect, it } from "vitest";

import { getCareerRole } from "@/features/goals/data/career-roles";
import { generateRecommendations } from "@/features/recommendations/services/generate-recommendations";
import type { StudentProfile } from "@/features/student-profile/types/student-profile";

import {
  applyRecommendationToProfile,
  simulateRecommendation,
} from "./simulate-recommendation";

const role = getCareerRole("product-engineer");

const profile: StudentProfile = {
  id: "student",
  name: "Student",
  courses: [
    {
      id: "react-course",
      title: "React Course",
      status: "in-progress",
      skillIds: ["react"],
    },
  ],
  experiences: [],
  skills: [
    {
      id: "react",
      name: "React",
      status: "developing",
    },
  ],
};

function getRecommendations() {
  return generateRecommendations({
    profile,
    role,
    limit: 10,
  });
}

describe("simulateRecommendation", () => {
  it("simulates an evidence package that may contain multiple skills", () => {
    const recommendation = getRecommendations()[0];

    expect(recommendation).toBeDefined();
    expect(recommendation.suggestedEvidenceSkillIds.length).toBeGreaterThan(
      0,
    );

    const result = simulateRecommendation(
      profile,
      role,
      recommendation,
    );

    expect(result.scoreAfter).toBeGreaterThanOrEqual(result.scoreBefore);
    expect(result.scoreIncrease).toBe(
      result.scoreAfter - result.scoreBefore,
    );
    expect(result.statusChange.competencyId).toBe(
      recommendation.competencyId,
    );

    const scenarioExperience = result.projectedProfile.experiences.find(
      (experience) =>
        experience.id ===
        `scenario-experience-${recommendation.competencyId}`,
    );

    expect(scenarioExperience?.skillIds).toEqual(
      recommendation.suggestedEvidenceSkillIds,
    );
  });

  it("matches the recommendation engine's estimated impact", () => {
    for (const recommendation of getRecommendations()) {
      const result = simulateRecommendation(
        profile,
        role,
        recommendation,
      );

      expect(result.scoreIncrease).toBe(
        recommendation.estimatedScoreIncrease,
      );
    }
  });

  it("does not mutate the original student profile", () => {
    const originalProfile = structuredClone(profile);

    simulateRecommendation(profile, role, getRecommendations()[0]);

    expect(profile).toEqual(originalProfile);
  });

  it("does not duplicate the same scenario experience", () => {
    const recommendation = getRecommendations()[0];
    const firstProjection = applyRecommendationToProfile(
      profile,
      recommendation,
    );
    const secondProjection = applyRecommendationToProfile(
      firstProjection,
      recommendation,
    );

    expect(
      secondProjection.experiences.filter(
        (experience) =>
          experience.id ===
          `scenario-experience-${recommendation.competencyId}`,
      ),
    ).toHaveLength(1);
  });

  it("rejects recommendations for competencies outside the selected role", () => {
    const recommendation = {
      ...getRecommendations()[0],
      competencyId: "unknown-competency",
      competencyName: "Unknown Competency",
    };

    expect(() =>
      simulateRecommendation(profile, role, recommendation),
    ).toThrow(
      'Cannot simulate a recommendation for unknown role competency "unknown-competency".',
    );
  });
});
