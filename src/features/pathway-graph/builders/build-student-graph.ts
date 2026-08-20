import type { CareerRole } from
  "@/features/goals/types/career-role";
import { getEvidenceSkillName } from
  "@/features/goals/data/evidence-skills";
import { calculateReadiness } from
  "@/features/readiness/services/calculate-readiness";
import type { DisplayStatus } from
  "@/features/readiness/types/readiness";
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
import { EVIDENCE_PACKAGE_EXPERIENCE_PREFIX } from
  "@/features/student-profile/services/apply-evidence-package";

import type {
  MovaEdge,
  MovaGraph,
  MovaNode,
  MovaNodeStatus,
  MovaRelationship,
} from "../types/graph";

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

function getCompetencyNodeStatus(
  displayStatus: DisplayStatus,
): MovaNodeStatus {
  switch (displayStatus) {
    case "demonstrated":
      return "complete";

    case "developing":
      return "in-progress";

    case "missing":
      return "missing";

    case "not-explored":
      return "not-explored";
  }
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
  const assessment = calculateReadiness(profile, role);

  const studentNodeId = `student-${profile.id}`;
  const roleNodeId = `role-${role.id}`;

  const visibleCourses = profile.courses.filter((course) =>
    isProfileItemVisible(course.status),
  );

  const visibleExperiences = profile.experiences.filter(
    (experience) => isProfileItemVisible(experience.status),
  );

  const studentSkillMap = new Map(
    profile.skills.map((skill) => [skill.id, skill]),
  );

  const allSkillIds = new Set<string>();

  for (const skill of profile.skills) {
    allSkillIds.add(skill.id);
  }

  for (const course of visibleCourses) {
    for (const skillId of course.skillIds) {
      allSkillIds.add(skillId);
    }
  }

  for (const experience of visibleExperiences) {
    for (const skillId of experience.skillIds) {
      allSkillIds.add(skillId);
    }
  }

  nodes.push({
    id: studentNodeId,
    type: "mova",
    position: { x: 0, y: 0 },
    data: {
      label: profile.name,
      category: "student",
      status: "in-progress",
      description: profile.program ?? "Student profile",
    },
  });

  const activities = [
    ...visibleCourses.map((course) => ({
      kind: "course" as const,
      item: course,
    })),
    ...visibleExperiences.map((experience) => ({
      kind: "experience" as const,
      item: experience,
    })),
  ];

  activities.forEach((activity) => {
    const nodeId = `${activity.kind}-${activity.item.id}`;

    if (activity.kind === "course") {
      const relationship = getCourseRelationship(
        activity.item.status,
      );

      nodes.push({
        id: nodeId,
        type: "mova",
        position: { x: 0, y: 0 },
        data: {
          label: activity.item.title,
          category: "course",
          status: getCourseNodeStatus(activity.item.status),
          description: activity.item.description,
          source: {
            kind: "course",
            itemId: activity.item.id,
          },
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

      for (const skillId of activity.item.skillIds) {
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

    const isScenarioExperience = activity.item.id.startsWith(
      `${EVIDENCE_PACKAGE_EXPERIENCE_PREFIX}-`,
    );

    const relationship = isScenarioExperience
      ? {
          label: "could complete",
          relationship: "created" as MovaRelationship,
        }
      : getExperienceRelationship(activity.item.status);

    nodes.push({
      id: nodeId,
      type: "mova",
      position: { x: 0, y: 0 },
      data: {
        label: activity.item.title,
        category: "experience",
        status: isScenarioExperience
          ? "scenario"
          : getExperienceNodeStatus(activity.item.status),
        description: isScenarioExperience
          ? [
              "Hypothetical:",
              activity.item.description ??
                "Projected completed experience",
            ].join(" ")
          : activity.item.description,
        source: {
          kind: "experience",
          itemId: activity.item.id,
        },
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

    for (const skillId of activity.item.skillIds) {
      const skillEdgeLabel =
        isScenarioExperience || activity.item.status === "planned"
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

  Array.from(allSkillIds).forEach((skillId) => {
    const studentSkill = studentSkillMap.get(skillId);

    nodes.push({
      id: `skill-${skillId}`,
      type: "mova",
      position: { x: 0, y: 0 },
      data: {
        label: studentSkill?.name ?? getEvidenceSkillName(skillId),
        category: "skill",
        status: getSkillNodeStatus(studentSkill),
        description:
          studentSkill?.status === "demonstrated"
            ? "Demonstrated student skill"
            : studentSkill
              ? "Developing student skill"
              : "Connected student skill",
        source: {
          kind: "skill",
          skillId,
        },
      },
    });
  });

  assessment.competencies.forEach((competency) => {
    const competencyNodeId = `competency-${competency.competencyId}`;
    const isCore = competency.tier === "core";

    nodes.push({
      id: competencyNodeId,
      type: "mova",
      position: { x: 0, y: 0 },
      data: {
        label: competency.competencyName,
        category: "competency",
        status: getCompetencyNodeStatus(competency.displayStatus),
        description: [
          competency.tier === "core"
            ? "Core competency"
            : competency.tier === "common"
              ? "Common competency"
              : "Specialized focus",
          competency.description,
        ].join(". "),
        source: {
          kind: "competency",
          competencyId: competency.competencyId,
        },
      },
    });

    edges.push(
      createEdge(
        `${competencyNodeId}-${roleNodeId}`,
        competencyNodeId,
        roleNodeId,
        competency.tier === "core"
          ? "core for"
          : competency.tier === "common"
            ? "common for"
            : "specialized for",
        isCore ? "requires" : "supports",
      ),
    );

    for (const match of competency.matchedEvidence) {
      if (!allSkillIds.has(match.skillId)) {
        continue;
      }

      edges.push(
        createEdge(
          `skill-${match.skillId}-${competencyNodeId}`,
          `skill-${match.skillId}`,
          competencyNodeId,
          "evidences",
          "supports",
        ),
      );
    }
  });

  nodes.push({
    id: roleNodeId,
    type: "mova",
    position: { x: 0, y: 0 },
    data: {
      label: role.title,
      category: "role",
      status: "recommended",
      description: role.description,
    },
  });

  recommendations.forEach((recommendation) => {
    const recommendationNodeId = recommendation.id;

    nodes.push({
      id: recommendationNodeId,
      type: "mova",
      position: { x: 0, y: 0 },
      data: {
        label: recommendation.title,
        category: "recommendation",
        status: "recommended",
        description: [
          recommendation.action,
          `Estimated impact: +${recommendation.estimatedScoreIncrease} readiness points.`,
        ].join(" "),
        source: {
          kind: "recommendation",
          recommendationId: recommendation.id,
        },
      },
    });

    edges.push(
      createEdge(
        `${recommendationNodeId}-competency-${recommendation.competencyId}`,
        recommendationNodeId,
        `competency-${recommendation.competencyId}`,
        "strengthens",
        "strengthens",
      ),
    );
  });

  return {
    nodes,
    edges,
  };
}
