import { describe, expect, it } from "vitest";

import { getCareerRole } from "@/features/goals/data/career-roles";
import { calculateReadiness } from "@/features/readiness/services/calculate-readiness";
import { applyEvidencePackageToProfile } from "@/features/student-profile/services/apply-evidence-package";
import type { StudentProfile } from "@/features/student-profile/types/student-profile";

import { generateRecommendations } from "./generate-recommendations";

function profileWithSkills(
  skills: Array<{ id: string; status: "demonstrated" | "developing" }>,
): StudentProfile {
  return {
    id: "student",
    name: "Student",
    courses: skills.map((skill) => ({
      id: `${skill.id}-course`,
      title: skill.id,
      status:
        skill.status === "demonstrated" ? "completed" : "in-progress",
      skillIds: [skill.id],
    })),
    experiences: [],
    skills: skills.map((skill) => ({
      id: skill.id,
      name: skill.id,
      status: skill.status,
    })),
  };
}

describe("generateRecommendations", () => {
  const role = getCareerRole("product-engineer");
  const profile = profileWithSkills([
    { id: "react", status: "demonstrated" },
    { id: "product-thinking", status: "developing" },
  ]);

  it("ranks core gaps ahead of common gaps", () => {
    const recommendations = generateRecommendations({
      profile,
      role,
      limit: 10,
    });

    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations[0].tier).toBe("core");
    expect(
      recommendations.map((recommendation) => recommendation.competencyId),
    ).not.toContain("design-systems");
  });

  it("does not recommend already demonstrated competencies", () => {
    const completeProfile = profileWithSkills([
      { id: "product-thinking", status: "demonstrated" },
      { id: "react", status: "demonstrated" },
      { id: "user-experience", status: "demonstrated" },
      { id: "deployment", status: "demonstrated" },
      { id: "postgresql", status: "demonstrated" },
      { id: "api-integration", status: "demonstrated" },
      { id: "software-testing", status: "demonstrated" },
      { id: "design-systems", status: "demonstrated" },
    ]);

    expect(
      generateRecommendations({
        profile: completeProfile,
        role,
      }),
    ).toEqual([]);
  });

  it("never chooses an already-satisfied evidence group", () => {
    const recommendations = generateRecommendations({
      profile,
      role,
      limit: 10,
    });

    const endToEnd = recommendations.find(
      (recommendation) =>
        recommendation.competencyId === "end-to-end-ownership",
    );

    expect(endToEnd?.suggestedEvidenceSkillIds).toEqual(["deployment"]);
    expect(endToEnd?.suggestedEvidenceSkillIds).not.toContain("react");
  });

  it("matches estimated impact to projected readiness", () => {
    const recommendations = generateRecommendations({
      profile,
      role,
      limit: 10,
    });

    const baseline = calculateReadiness(profile, role);

    for (const recommendation of recommendations) {
      const projected = calculateReadiness(
        applyEvidencePackageToProfile(profile, {
          idSuffix: recommendation.competencyId,
          title: recommendation.title,
          description: recommendation.action,
          skillIds: recommendation.suggestedEvidenceSkillIds,
        }),
        role,
      );

      expect(recommendation.estimatedScoreIncrease).toBe(
        Math.max(0, projected.score - baseline.score),
      );
    }
  });

  it("returns the top three recommendations by default", () => {
    expect(
      generateRecommendations({
        profile,
        role,
      }),
    ).toHaveLength(3);
  });
});
