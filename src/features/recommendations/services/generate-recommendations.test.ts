import {
    describe,
    expect,
    it,
  } from "vitest";
  
  import type { ReadinessAssessment } from "@/features/readiness/types/readiness";
  
  import { generateRecommendations } from "./generate-recommendations";
  
  const assessment: ReadinessAssessment = {
    score: 44,
    demonstratedCount: 1,
    developingCount: 2,
    missingCount: 2,
    totalRequirements: 5,
  
    requirements: [
      {
        skillId: "typescript",
        skillName: "TypeScript",
        importance: "required",
        status: "demonstrated",
        weight: 2,
        earnedWeight: 2,
      },
      {
        skillId: "product-thinking",
        skillName: "Product Thinking",
        importance: "required",
        status: "missing",
        weight: 2,
        earnedWeight: 0,
      },
      {
        skillId: "react",
        skillName: "React",
        importance: "required",
        status: "developing",
        weight: 2,
        earnedWeight: 1,
      },
      {
        skillId: "design-systems",
        skillName: "Design Systems",
        importance: "preferred",
        status: "missing",
        weight: 1,
        earnedWeight: 0,
      },
      {
        skillId: "user-experience",
        skillName: "User Experience",
        importance: "preferred",
        status: "developing",
        weight: 1,
        earnedWeight: 0.5,
      },
    ],
  };
  
  describe("generateRecommendations", () => {
    it("ranks gaps by importance and readiness status", () => {
      const recommendations =
        generateRecommendations(assessment, {
          limit: 10,
        });
  
      expect(
        recommendations.map(
          (recommendation) =>
            recommendation.skillId,
        ),
      ).toEqual([
        "product-thinking",
        "react",
        "design-systems",
        "user-experience",
      ]);
  
      expect(
        recommendations.map(
          (recommendation) =>
            recommendation.priority,
        ),
      ).toEqual([1, 2, 3, 4]);
    });
  
    it("does not recommend already demonstrated skills", () => {
      const recommendations =
        generateRecommendations(assessment, {
          limit: 10,
        });
  
      expect(
        recommendations.some(
          (recommendation) =>
            recommendation.skillId ===
            "typescript",
        ),
      ).toBe(false);
    });
  
    it("returns the top three recommendations by default", () => {
      const recommendations =
        generateRecommendations(assessment);
  
      expect(recommendations).toHaveLength(3);
  
      expect(
        recommendations.map(
          (recommendation) =>
            recommendation.skillId,
        ),
      ).toEqual([
        "product-thinking",
        "react",
        "design-systems",
      ]);
    });
  
    it("estimates the score increase from demonstrating each skill", () => {
      const recommendations =
        generateRecommendations(assessment, {
          limit: 10,
        });
  
      const productThinking =
        recommendations.find(
          (recommendation) =>
            recommendation.skillId ===
            "product-thinking",
        );
  
      const react = recommendations.find(
        (recommendation) =>
          recommendation.skillId === "react",
      );
  
      const userExperience =
        recommendations.find(
          (recommendation) =>
            recommendation.skillId ===
            "user-experience",
        );
  
      expect(
        productThinking?.estimatedScoreIncrease,
      ).toBe(25);
  
      expect(
        react?.estimatedScoreIncrease,
      ).toBe(12);
  
      expect(
        userExperience?.estimatedScoreIncrease,
      ).toBe(6);
    });
  
    it("assigns action types based on the current evidence status", () => {
      const recommendations =
        generateRecommendations(assessment, {
          limit: 10,
        });
  
      const missingSkill =
        recommendations.find(
          (recommendation) =>
            recommendation.skillId ===
            "product-thinking",
        );
  
      const developingSkill =
        recommendations.find(
          (recommendation) =>
            recommendation.skillId ===
            "react",
        );
  
      expect(
        missingSkill?.actionType,
      ).toBe("create-evidence");
  
      expect(
        developingSkill?.actionType,
      ).toBe("strengthen-evidence");
    });
  
    it("returns no recommendations when all requirements are demonstrated", () => {
      const completeAssessment:
        ReadinessAssessment = {
        score: 100,
        demonstratedCount: 1,
        developingCount: 0,
        missingCount: 0,
        totalRequirements: 1,
        requirements: [
          {
            skillId: "typescript",
            skillName: "TypeScript",
            importance: "required",
            status: "demonstrated",
            weight: 2,
            earnedWeight: 2,
          },
        ],
      };
  
      expect(
        generateRecommendations(
          completeAssessment,
        ),
      ).toEqual([]);
    });
  });