import type { CareerRole } from
  "@/features/goals/types/career-role";
import type { NextMoveRecommendation } from
  "@/features/recommendations/types/recommendation";
import type {
  CourseProgress,
  ExperienceProgress,
  StudentProfile,
  StudentSkill,
} from "@/features/student-profile/types/student-profile";
import { isProfileItemVisible } from
  "@/features/student-profile/utils/profile-item-status";

import type {
  MovaEdge,
  MovaGraph,
  MovaNode,
  MovaNodeStatus,
  MovaRelationship,
} from "../types/graph";

const SCENARIO_EXPERIENCE_PREFIX =
  "scenario-experience-";

function getCourseNodeStatus(
  status: CourseProgress,
): MovaNodeStatus {
  switch (status) {
    case "completed":
      return "complete";

    case "in-progress":
      return "in-progress";

    case "planned":
      return "planned";

    case "dropped":
      return "planned";
  }
}

function getExperienceNodeStatus(
  status: ExperienceProgress,
): MovaNodeStatus {
  switch (status) {
    case "completed":
      return "complete";

    case "in-progress":
      return "in-progress";

    case "planned":
      return "planned";

    case "dropped":
      return "planned";
  }
}

function getSkillNodeStatus(
  skill?: StudentSkill,
): MovaNodeStatus {
  if (!skill) {
    return "missing";
  }

  return skill.status === "demonstrated"
    ? "complete"
    : "in-progress";
}

function getCourseRelationship(
  status: CourseProgress,
): {
  label: string;
  relationship: MovaRelationship;
} {
  switch (status) {
    case "completed":
      return {
        label: "completed",
        relationship: "completed",
      };

    case "in-progress":
      return {
        label: "taking",
        relationship: "pursuing",
      };

    case "planned":
      return {
        label: "plans to take",
        relationship: "plans",
      };

    case "dropped":
      return {
        label: "dropped",
        relationship: "plans",
      };
  }
}

function getExperienceRelationship(
  status: ExperienceProgress,
): {
  label: string;
  relationship: MovaRelationship;
} {
  switch (status) {
    case "completed":
      return {
        label: "completed",
        relationship: "created",
      };

    case "in-progress":
      return {
        label: "working on",
        relationship: "pursuing",
      };

    case "planned":
      return {
        label: "plans to pursue",
        relationship: "plans",
      };

    case "dropped":
      return {
        label: "dropped",
        relationship: "plans",
      };
  }
}

function createEdge(
  id: string,
  source: string,
  target: string,
  label: string,
  relationship: MovaRelationship,
): MovaEdge {
  return {
    id,
    source,
    target,
    label,

    data: {
      relationship,
    },
  };
}

export function buildStudentGraph(
  profile: StudentProfile,
  role: CareerRole,
  recommendations: NextMoveRecommendation[] = [],
): MovaGraph {
  const nodes: MovaNode[] = [];
  const edges: MovaEdge[] = [];

  const studentNodeId =
    `student-${profile.id}`;

  const roleNodeId =
    `role-${role.id}`;

  /*
   * Dropped courses and experiences remain in the saved
   * profile but are excluded from the primary opportunity map.
   */
  const visibleCourses =
    profile.courses.filter((course) =>
      isProfileItemVisible(
        course.status,
      ),
    );

  const visibleExperiences =
    profile.experiences.filter(
      (experience) =>
        isProfileItemVisible(
          experience.status,
        ),
    );

  const studentSkillMap = new Map(
    profile.skills.map((skill) => [
      skill.id,
      skill,
    ]),
  );

  const roleRequirementMap = new Map(
    role.requirements.map(
      (requirement) => [
        requirement.skillId,
        requirement,
      ],
    ),
  );

  /*
   * Include skills from:
   * - the reconciled student profile
   * - visible courses
   * - visible experiences
   * - the selected role requirements
   *
   * Planned items remain visible in the graph, but their
   * skills receive no readiness credit.
   */
  const allSkillIds =
    new Set<string>();

  for (const skill of profile.skills) {
    allSkillIds.add(skill.id);
  }

  for (const course of visibleCourses) {
    for (const skillId of course.skillIds) {
      allSkillIds.add(skillId);
    }
  }

  for (
    const experience of
    visibleExperiences
  ) {
    for (
      const skillId of
      experience.skillIds
    ) {
      allSkillIds.add(skillId);
    }
  }

  for (
    const requirement of
    role.requirements
  ) {
    allSkillIds.add(
      requirement.skillId,
    );
  }

  const skillIds =
    Array.from(allSkillIds);

  nodes.push({
    id: studentNodeId,
    type: "mova",

    position: {
      x: 0,
      y: 0,
    },

    data: {
      label: profile.name,
      category: "student",
      status: "in-progress",

      description:
        profile.program ??
        "Student profile",
    },
  });

  const activities = [
    ...visibleCourses.map((course) => ({
      kind: "course" as const,
      item: course,
    })),

    ...visibleExperiences.map(
      (experience) => ({
        kind: "experience" as const,
        item: experience,
      }),
    ),
  ];

  activities.forEach((activity) => {
    const nodeId =
      `${activity.kind}-${activity.item.id}`;

    if (activity.kind === "course") {
      const relationship =
        getCourseRelationship(
          activity.item.status,
        );

      nodes.push({
        id: nodeId,
        type: "mova",

        position: {
          x: 0,
          y: 0,
        },

        data: {
          label:
            activity.item.title,

          category: "course",

          status:
            getCourseNodeStatus(
              activity.item.status,
            ),

          description:
            activity.item.description,
        },
      });

      edges.push(
        createEdge(
          `${studentNodeId}-${nodeId}`,
          studentNodeId,
          nodeId,
          relationship.label,
          relationship.relationship,
        ),
      );

      for (
        const skillId of
        activity.item.skillIds
      ) {
        edges.push(
          createEdge(
            `${nodeId}-skill-${skillId}`,
            nodeId,
            `skill-${skillId}`,
            "teaches",
            "teaches",
          ),
        );
      }

      return;
    }

    const isScenarioExperience =
      activity.item.id.startsWith(
        SCENARIO_EXPERIENCE_PREFIX,
      );

    const relationship =
      isScenarioExperience
        ? {
            label: "could complete",

            relationship:
              "created" as MovaRelationship,
          }
        : getExperienceRelationship(
            activity.item.status,
          );

    nodes.push({
      id: nodeId,
      type: "mova",

      position: {
        x: 0,
        y: 0,
      },

      data: {
        label: activity.item.title,
        category: "experience",

        status: isScenarioExperience
          ? "scenario"
          : getExperienceNodeStatus(
              activity.item.status,
            ),

        description:
          isScenarioExperience
            ? [
                "Hypothetical:",
                activity.item
                  .description ??
                  "Projected completed experience",
              ].join(" ")
            : activity.item
                .description,
      },
    });

    edges.push(
      createEdge(
        `${studentNodeId}-${nodeId}`,
        studentNodeId,
        nodeId,
        relationship.label,
        relationship.relationship,
      ),
    );

    for (
      const skillId of
      activity.item.skillIds
    ) {
      const skillEdgeLabel =
        isScenarioExperience ||
        activity.item.status ===
          "planned"
          ? "could demonstrate"
          : "demonstrates";

      edges.push(
        createEdge(
          `${nodeId}-skill-${skillId}`,
          nodeId,
          `skill-${skillId}`,
          skillEdgeLabel,
          "demonstrates",
        ),
      );
    }
  });

  skillIds.forEach((skillId) => {
    const studentSkill =
      studentSkillMap.get(skillId);

    const roleRequirement =
      roleRequirementMap.get(skillId);

    const skillName =
      studentSkill?.name ??
      roleRequirement?.skillName ??
      skillId;

    let description =
      "Connected student skill";

    if (roleRequirement) {
      description =
        roleRequirement.importance ===
        "required"
          ? "Required for target role"
          : "Preferred for target role";
    } else if (
      studentSkill?.status ===
      "demonstrated"
    ) {
      description =
        "Demonstrated student skill";
    } else if (studentSkill) {
      description =
        "Developing student skill";
    }

    nodes.push({
      id: `skill-${skillId}`,
      type: "mova",

      position: {
        x: 0,
        y: 0,
      },

      data: {
        label: skillName,
        category: "skill",

        status:
          getSkillNodeStatus(
            studentSkill,
          ),

        description,
      },
    });

    if (roleRequirement) {
      const isRequired =
        roleRequirement.importance ===
        "required";

      edges.push(
        createEdge(
          `skill-${skillId}-${roleNodeId}`,
          `skill-${skillId}`,
          roleNodeId,

          isRequired
            ? "required by"
            : "preferred for",

          isRequired
            ? "requires"
            : "supports",
        ),
      );
    }
  });

  nodes.push({
    id: roleNodeId,
    type: "mova",

    position: {
      x: 0,
      y: 0,
    },

    data: {
      label: role.title,
      category: "role",
      status: "recommended",
      description: role.description,
    },
  });

  recommendations.forEach(
    (recommendation) => {
      const recommendationNodeId =
        recommendation.id;

      nodes.push({
        id: recommendationNodeId,
        type: "mova",

        position: {
          x: 0,
          y: 0,
        },

        data: {
          label:
            recommendation.title,

          category:
            "recommendation",

          status: "recommended",

          description: [
            recommendation.action,

            `Estimated impact: +${recommendation.estimatedScoreIncrease} readiness points.`,
          ].join(" "),
        },
      });

      edges.push(
        createEdge(
          `${recommendationNodeId}-skill-${recommendation.skillId}`,
          recommendationNodeId,
          `skill-${recommendation.skillId}`,
          "strengthens",
          "strengthens",
        ),
      );
    },
  );

  return {
    nodes,
    edges,
  };
}