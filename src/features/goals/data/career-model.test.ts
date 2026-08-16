import { describe, expect, it } from "vitest";

import { careerCompetencies } from "./competencies";
import { careerRoles } from "./career-roles";
import {
  createEvidenceLookupKey,
  evidenceSkills,
  findEvidenceLookupConflicts,
} from "./evidence-skills";

describe("career model invariants", () => {
  it("has unique evidence skill IDs", () => {
    const ids = evidenceSkills.map((skill) => skill.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has unique competency IDs", () => {
    const ids = careerCompetencies.map(
      (competency) => competency.id,
    );

    expect(new Set(ids).size).toBe(ids.length);
  });

  it("requires a description on every competency", () => {
    for (const competency of careerCompetencies) {
      expect(competency.description.trim().length).toBeGreaterThan(
        0,
      );
    }
  });

  it("has nonempty groups with unique IDs and valid minimumGroups", () => {
    const evidenceIds = new Set(
      evidenceSkills.map((skill) => skill.id),
    );

    for (const competency of careerCompetencies) {
      const groups = competency.evidence.groups;

      expect(groups.length).toBeGreaterThan(0);

      const groupIds = groups.map((group) => group.id);
      expect(new Set(groupIds).size).toBe(groupIds.length);

      for (const group of groups) {
        expect(group.skillIds.length).toBeGreaterThan(0);
        expect(new Set(group.skillIds).size).toBe(
          group.skillIds.length,
        );

        for (const skillId of group.skillIds) {
          expect(evidenceIds.has(skillId)).toBe(true);
        }
      }

      const minimumGroups =
        competency.evidence.minimumGroups ?? groups.length;

      expect(minimumGroups).toBeGreaterThanOrEqual(1);
      expect(minimumGroups).toBeLessThanOrEqual(groups.length);
    }
  });

  it("references only catalog competencies and unique IDs per role", () => {
    const competencyIds = new Set(
      careerCompetencies.map((competency) => competency.id),
    );

    for (const role of careerRoles) {
      expect(role.modelVersion).toBe(2);

      const assignedIds = role.competencies.map(
        (assignment) => assignment.competencyId,
      );

      expect(new Set(assignedIds).size).toBe(assignedIds.length);

      for (const assignment of role.competencies) {
        expect(competencyIds.has(assignment.competencyId)).toBe(
          true,
        );
      }
    }
  });

  it("does not resolve aliases to multiple canonical evidence IDs", () => {
    expect(findEvidenceLookupConflicts()).toEqual([]);
  });

  it("does not alias ios, android, api development, or product development incorrectly", () => {
    const forbidden: Record<string, string> = {
      ios: "swift",
      android: "kotlin",
      "api development": "api-design",
      "product development": "product-thinking",
    };

    for (const skill of evidenceSkills) {
      const keys = [
        createEvidenceLookupKey(skill.id),
        createEvidenceLookupKey(skill.name),
        ...(skill.aliases ?? []).map(createEvidenceLookupKey),
      ];

      for (const [alias, forbiddenId] of Object.entries(
        forbidden,
      )) {
        if (keys.includes(createEvidenceLookupKey(alias))) {
          expect(skill.id).not.toBe(forbiddenId);
        }
      }
    }
  });
});
