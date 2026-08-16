import { describe, expect, it } from "vitest";

import {
  defaultCareerRoleId,
  getCareerRole,
} from "@/features/goals/data/career-roles";
import { calculateReadiness } from
  "@/features/readiness/services/calculate-readiness";
import { generateRecommendations } from
  "@/features/recommendations/services/generate-recommendations";

import { sampleStudentProfile } from
  "../data/sample-student";
import { buildStudentGraph } from
  "./build-student-graph";

describe("buildStudentGraph", () => {
  it("adds recommendation nodes connected to competencies", () => {
    const role = getCareerRole(defaultCareerRoleId);
    const recommendations = generateRecommendations({
      profile: sampleStudentProfile,
      role,
    });

    const graph = buildStudentGraph(
      sampleStudentProfile,
      role,
      recommendations,
    );

    const recommendationNodes = graph.nodes.filter(
      (node) => node.data.category === "recommendation",
    );

    expect(recommendationNodes).toHaveLength(recommendations.length);

    for (const recommendation of recommendations) {
      expect(
        graph.nodes.find((node) => node.id === recommendation.id),
      ).toBeDefined();

      expect(
        graph.edges.find(
          (edge) =>
            edge.source === recommendation.id &&
            edge.target ===
              `competency-${recommendation.competencyId}` &&
            edge.data?.relationship === "strengthens",
        ),
      ).toBeDefined();
    }
  });

  it("uses readiness display status for competency nodes", () => {
    const role = getCareerRole("mobile-engineer");
    const assessment = calculateReadiness(sampleStudentProfile, role);
    const graph = buildStudentGraph(sampleStudentProfile, role);

    for (const competency of assessment.competencies) {
      const node = graph.nodes.find(
        (current) =>
          current.id === `competency-${competency.competencyId}`,
      );

      expect(node?.data.category).toBe("competency");

      if (competency.displayStatus === "not-explored") {
        expect(node?.data.status).toBe("not-explored");
      }
    }
  });

  it("does not add recommendation nodes when none are supplied", () => {
    const role = getCareerRole(defaultCareerRoleId);
    const graph = buildStudentGraph(sampleStudentProfile, role);

    expect(
      graph.nodes.some(
        (node) => node.data.category === "recommendation",
      ),
    ).toBe(false);
  });
});
