import { describe, expect, it } from "vitest";

import { getCompetencyDefinition } from "@/features/goals/data/competencies";
import type { StudentSkill } from "@/features/student-profile/types/student-profile";

import {
  evaluateCompetencyEvidence,
  suggestEvidenceSkillIds,
} from "./evaluate-competency-evidence";

function skill(
  id: string,
  status: StudentSkill["status"],
): StudentSkill {
  return { id, name: id, status };
}

describe("evaluateCompetencyEvidence", () => {
  it("lets one alternative in a group satisfy that group", () => {
    const evaluation = evaluateCompetencyEvidence(
      getCompetencyDefinition("frontend-application-engineering"),
      [skill("react", "demonstrated")],
    );

    expect(evaluation.evidenceStatus).toBe("demonstrated");
    expect(evaluation.groups[0].status).toBe("demonstrated");
    expect(evaluation.matchedEvidence.map((match) => match.skillId)).toEqual([
      "react",
    ]);
  });

  it("treats frontend-development as sufficient frontend application evidence", () => {
    const evaluation = evaluateCompetencyEvidence(
      getCompetencyDefinition("frontend-application-engineering"),
      [skill("frontend-development", "demonstrated")],
    );

    expect(evaluation.evidenceStatus).toBe("demonstrated");
  });

  it("does not treat HTML/CSS as frontend application engineering", () => {
    const evaluation = evaluateCompetencyEvidence(
      getCompetencyDefinition("frontend-application-engineering"),
      [skill("html-css", "demonstrated")],
    );

    expect(evaluation.evidenceStatus).toBe("missing");
    expect(evaluation.competencyCredit).toBe(0);
  });

  it("does not treat TypeScript as backend/API development", () => {
    const evaluation = evaluateCompetencyEvidence(
      getCompetencyDefinition("backend-api-development"),
      [skill("typescript", "demonstrated")],
    );

    expect(evaluation.evidenceStatus).toBe("missing");
  });

  it("does not treat TypeScript as end-to-end delivery", () => {
    const evaluation = evaluateCompetencyEvidence(
      getCompetencyDefinition("end-to-end-ownership"),
      [skill("typescript", "demonstrated")],
    );

    expect(evaluation.evidenceStatus).toBe("missing");
    expect(evaluation.competencyCredit).toBe(0);
  });

  it("requires the configured number of groups to demonstrate", () => {
    const evaluation = evaluateCompetencyEvidence(
      getCompetencyDefinition("end-to-end-ownership"),
      [skill("react", "demonstrated")],
    );

    expect(evaluation.evidenceStatus).toBe("developing");
    expect(
      evaluation.groups.find((group) => group.groupId === "implementation")
        ?.status,
    ).toBe("demonstrated");
    expect(
      evaluation.groups.find((group) => group.groupId === "delivery")
        ?.status,
    ).toBe("missing");
    expect(evaluation.competencyCredit).toBe(0.5);
  });

  it("gives 0.25 credit for one developing group of two", () => {
    const evaluation = evaluateCompetencyEvidence(
      getCompetencyDefinition("user-facing-engineering"),
      [skill("react", "developing")],
    );

    expect(evaluation.evidenceStatus).toBe("developing");
    expect(evaluation.competencyCredit).toBe(0.25);
  });

  it("lets demonstrated evidence beat developing evidence within a group", () => {
    const evaluation = evaluateCompetencyEvidence(
      getCompetencyDefinition("frontend-application-engineering"),
      [
        skill("react", "developing"),
        skill("frontend-development", "demonstrated"),
      ],
    );

    expect(evaluation.evidenceStatus).toBe("demonstrated");
    expect(evaluation.groups[0].status).toBe("demonstrated");
  });

  it("does not treat PostgreSQL alone as Application Data & APIs", () => {
    const evaluation = evaluateCompetencyEvidence(
      getCompetencyDefinition("application-data-and-apis"),
      [skill("postgresql", "demonstrated")],
    );

    expect(evaluation.evidenceStatus).toBe("developing");
    expect(evaluation.competencyCredit).toBe(0.5);
  });

  it("treats database-development or postgresql as data/database evidence", () => {
    expect(
      evaluateCompetencyEvidence(
        getCompetencyDefinition("data-database-development"),
        [skill("postgresql", "demonstrated")],
      ).evidenceStatus,
    ).toBe("demonstrated");

    expect(
      evaluateCompetencyEvidence(
        getCompetencyDefinition("data-database-development"),
        [skill("database-development", "demonstrated")],
      ).evidenceStatus,
    ).toBe("demonstrated");
  });

  it("does not suggest skills from already demonstrated groups", () => {
    const definition = getCompetencyDefinition("end-to-end-ownership");
    const evaluation = evaluateCompetencyEvidence(definition, [
      skill("react", "demonstrated"),
    ]);

    const suggested = suggestEvidenceSkillIds(
      definition,
      evaluation.groups,
    );

    expect(suggested).toEqual(["deployment"]);
  });

  it("does not treat api-integration as backend/API development", () => {
    expect(
      evaluateCompetencyEvidence(
        getCompetencyDefinition("backend-api-development"),
        [skill("api-integration", "demonstrated")],
      ).evidenceStatus,
    ).toBe("missing");
  });

  it("does not treat api-design as backend/API development", () => {
    expect(
      evaluateCompetencyEvidence(
        getCompetencyDefinition("backend-api-development"),
        [skill("api-design", "demonstrated")],
      ).evidenceStatus,
    ).toBe("missing");
  });

  it("does not treat api-design as frontend API consumption", () => {
    expect(
      evaluateCompetencyEvidence(
        getCompetencyDefinition("api-consumption"),
        [skill("api-design", "demonstrated")],
      ).evidenceStatus,
    ).toBe("missing");
  });

  it("does not treat api-development as mobile networking", () => {
    expect(
      evaluateCompetencyEvidence(
        getCompetencyDefinition("mobile-api-networking"),
        [skill("api-development", "demonstrated")],
      ).evidenceStatus,
    ).toBe("missing");
  });

  it("treats api-integration as frontend consumption and mobile networking", () => {
    expect(
      evaluateCompetencyEvidence(
        getCompetencyDefinition("api-consumption"),
        [skill("api-integration", "demonstrated")],
      ).evidenceStatus,
    ).toBe("demonstrated");

    expect(
      evaluateCompetencyEvidence(
        getCompetencyDefinition("mobile-api-networking"),
        [skill("api-integration", "demonstrated")],
      ).evidenceStatus,
    ).toBe("demonstrated");
  });

  it("treats backend-development or api-development as backend/API development", () => {
    expect(
      evaluateCompetencyEvidence(
        getCompetencyDefinition("backend-api-development"),
        [skill("backend-development", "demonstrated")],
      ).evidenceStatus,
    ).toBe("demonstrated");

    expect(
      evaluateCompetencyEvidence(
        getCompetencyDefinition("backend-api-development"),
        [skill("api-development", "demonstrated")],
      ).evidenceStatus,
    ).toBe("demonstrated");
  });
});
