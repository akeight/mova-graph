import { describe, expect, it } from "vitest";

import { EVIDENCE_PACKAGE_EXPERIENCE_PREFIX } from
  "@/features/student-profile/services/apply-evidence-package";

import { resolveGraphNodeAction } from "./resolve-graph-node-action";

describe("resolveGraphNodeAction", () => {
  it("opens activity editing for course and experience nodes", () => {
    expect(
      resolveGraphNodeAction({
        data: {
          label: "Itron",
          category: "experience",
          source: {
            kind: "experience",
            itemId: "itron-internship",
          },
        },
      }),
    ).toEqual({
      type: "edit-activity",
      itemKind: "experience",
      itemId: "itron-internship",
    });

    expect(
      resolveGraphNodeAction({
        data: {
          label: "Web Development",
          category: "course",
          source: {
            kind: "course",
            itemId: "web-development",
          },
        },
      }),
    ).toEqual({
      type: "edit-activity",
      itemKind: "course",
      itemId: "web-development",
    });
  });

  it("ignores simulated scenario activities", () => {
    expect(
      resolveGraphNodeAction({
        data: {
          label: "Projected move",
          category: "experience",
          source: {
            kind: "experience",
            itemId: `${EVIDENCE_PACKAGE_EXPERIENCE_PREFIX}-software-quality`,
          },
        },
      }),
    ).toEqual({ type: "none" });
  });

  it("opens manage evidence for skill nodes", () => {
    expect(
      resolveGraphNodeAction({
        data: {
          label: "React",
          category: "skill",
          source: {
            kind: "skill",
            skillId: "react",
          },
        },
      }),
    ).toEqual({
      type: "manage-skill-evidence",
      skillId: "react",
    });
  });

  it("navigates competency nodes to Skill Gaps and recommendations to Next Steps", () => {
    expect(
      resolveGraphNodeAction({
        data: {
          label: "Software Quality",
          category: "competency",
          source: {
            kind: "competency",
            competencyId: "software-quality",
          },
        },
      }),
    ).toEqual({
      type: "navigate",
      view: "skill-gaps",
    });

    expect(
      resolveGraphNodeAction({
        data: {
          label: "Build evidence",
          category: "recommendation",
          source: {
            kind: "recommendation",
            recommendationId: "recommendation-software-quality-missing",
          },
        },
      }),
    ).toEqual({
      type: "navigate",
      view: "next-steps",
    });
  });

  it("does not edit role or student nodes", () => {
    expect(
      resolveGraphNodeAction({
        data: {
          label: "Product Engineer",
          category: "role",
        },
      }),
    ).toEqual({ type: "none" });
  });
});
