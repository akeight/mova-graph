import {
    describe,
    expect,
    it,
  } from "vitest";
  
  import type { CareerRole } from "@/features/goals/types/career-role";
  import { calculateReadiness } from "@/features/readiness/services/calculate-readiness";
  import { generateRecommendations } from "@/features/recommendations/services/generate-recommendations";
  import type { StudentProfile } from "@/features/student-profile/types/student-profile";
  
  import {
    applyRecommendationToProfile,
    simulateRecommendation,
  } from "./simulate-recommendation";
  
  const role: CareerRole = {
    id: "product-engineer",
    title: "Product Engineer",
  
    requirements: [
      {
        skillId: "product-thinking",
        skillName: "Product Thinking",
        importance: "required",
      },
      {
        skillId: "react",
        skillName: "React",
        importance: "required",
      },
      {
        skillId: "design-systems",
        skillName: "Design Systems",
        importance: "preferred",
      },
    ],
  };
  
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
    const assessment = calculateReadiness(
      profile,
      role,
    );
  
    return generateRecommendations(
      assessment,
      {
        limit: 10,
      },
    );
  }
  
  describe("simulateRecommendation", () => {
    it("simulates building evidence for a missing skill", () => {
      const recommendation =
        getRecommendations().find(
          (currentRecommendation) =>
            currentRecommendation.skillId ===
            "product-thinking",
        );
  
      expect(recommendation).toBeDefined();
  
      const result = simulateRecommendation(
        profile,
        role,
        recommendation!,
      );
  
      expect(result.scoreBefore).toBe(20);
      expect(result.scoreAfter).toBe(60);
      expect(result.scoreIncrease).toBe(40);
  
      expect(result.statusChange).toEqual({
        skillId: "product-thinking",
        skillName: "Product Thinking",
        before: "missing",
        after: "demonstrated",
      });
    });
  
    it("simulates strengthening developing evidence", () => {
      const recommendation =
        getRecommendations().find(
          (currentRecommendation) =>
            currentRecommendation.skillId ===
            "react",
        );
  
      expect(recommendation).toBeDefined();
  
      const result = simulateRecommendation(
        profile,
        role,
        recommendation!,
      );
  
      expect(result.scoreBefore).toBe(20);
      expect(result.scoreAfter).toBe(40);
      expect(result.scoreIncrease).toBe(20);
  
      expect(result.statusChange).toEqual({
        skillId: "react",
        skillName: "React",
        before: "developing",
        after: "demonstrated",
      });
    });
  
    it("matches the recommendation engine's estimated impact", () => {
      const recommendations =
        getRecommendations();
  
      for (const recommendation of recommendations) {
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
      const recommendation =
        getRecommendations()[0];
  
      const originalProfile =
        structuredClone(profile);
  
      simulateRecommendation(
        profile,
        role,
        recommendation,
      );
  
      expect(profile).toEqual(originalProfile);
    });
  
    it("adds a completed scenario experience to the projected profile", () => {
      const recommendation =
        getRecommendations()[0];
  
      const result = simulateRecommendation(
        profile,
        role,
        recommendation,
      );
  
      const scenarioExperience =
        result.projectedProfile.experiences.find(
          (experience) =>
            experience.id ===
            `scenario-experience-${recommendation.skillId}`,
        );
  
      expect(scenarioExperience).toEqual({
        id: `scenario-experience-${recommendation.skillId}`,
        title: recommendation.title,
        description: recommendation.action,
        status: "completed",
        skillIds: [recommendation.skillId],
      });
    });
  
    it("does not duplicate the same scenario experience", () => {
      const recommendation =
        getRecommendations()[0];
  
      const firstProjection =
        applyRecommendationToProfile(
          profile,
          recommendation,
        );
  
      const secondProjection =
        applyRecommendationToProfile(
          firstProjection,
          recommendation,
        );
  
      const matchingExperiences =
        secondProjection.experiences.filter(
          (experience) =>
            experience.id ===
            `scenario-experience-${recommendation.skillId}`,
        );
  
      expect(matchingExperiences).toHaveLength(1);
    });
  
    it("rejects recommendations for skills outside the selected role", () => {
      const recommendation = {
        ...getRecommendations()[0],
        skillId: "unknown-skill",
        skillName: "Unknown Skill",
      };
  
      expect(() =>
        simulateRecommendation(
          profile,
          role,
          recommendation,
        ),
      ).toThrow(
        'Cannot simulate a recommendation for unknown role skill "unknown-skill".',
      );
    });
  });