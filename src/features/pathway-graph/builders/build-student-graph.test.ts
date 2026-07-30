import {
    describe,
    expect,
    it,
  } from "vitest";
  
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
    it("adds recommendation nodes connected to affected skills", () => {
      const role = getCareerRole(
        defaultCareerRoleId,
      );
  
      const assessment = calculateReadiness(
        sampleStudentProfile,
        role,
      );
  
      const recommendations =
        generateRecommendations(assessment);
  
      const graph = buildStudentGraph(
        sampleStudentProfile,
        role,
        recommendations,
      );
  
      const recommendationNodes =
        graph.nodes.filter(
          (node) =>
            node.data.category ===
            "recommendation",
        );
  
      expect(recommendationNodes).toHaveLength(
        recommendations.length,
      );
  
      for (const recommendation of recommendations) {
        expect(
          graph.nodes.find(
            (node) =>
              node.id === recommendation.id,
          ),
        ).toBeDefined();
  
        expect(
          graph.edges.find(
            (edge) =>
              edge.source ===
                recommendation.id &&
              edge.target ===
                `skill-${recommendation.skillId}` &&
              edge.data?.relationship ===
                "strengthens",
          ),
        ).toBeDefined();
      }
    });
  
    it("does not add recommendation nodes when none are supplied", () => {
      const role = getCareerRole(
        defaultCareerRoleId,
      );
  
      const graph = buildStudentGraph(
        sampleStudentProfile,
        role,
      );
  
      expect(
        graph.nodes.some(
          (node) =>
            node.data.category ===
            "recommendation",
        ),
      ).toBe(false);
    });
  });