import type { CareerRole } from
  "@/features/goals/types/career-role";
import type {
  CourseProgress,
  ExperienceProgress,
  StudentProfile,
  StudentSkill,
} from "@/features/student-profile/types/student-profile";

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
  if (status === "completed") {
    return "complete";
  }

  return "in-progress";
}

function getExperienceNodeStatus(
  status: ExperienceProgress,
): MovaNodeStatus {
  return status === "completed"
    ? "complete"
    : "in-progress";
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
): MovaGraph {
  const nodes: MovaNode[] = [];
  const edges: MovaEdge[] = [];

  const studentNodeId = `student-${profile.id}`;
  const roleNodeId = `role-${role.id}`;

  const studentSkillMap = new Map(
    profile.skills.map((skill) => [
      skill.id,
      skill,
    ]),
  );

  const roleRequirementMap = new Map(
    role.requirements.map((requirement) => [
      requirement.skillId,
      requirement,
    ]),
  );

  const allSkillIds = new Set<string>();

  for (const skill of profile.skills) {
    allSkillIds.add(skill.id);
  }

  for (const course of profile.courses) {
    for (const skillId of course.skillIds) {
      allSkillIds.add(skillId);
    }
  }

  for (const experience of profile.experiences) {
    for (const skillId of experience.skillIds) {
      allSkillIds.add(skillId);
    }
  }

  for (const requirement of role.requirements) {
    allSkillIds.add(requirement.skillId);
  }

  const skillIds = Array.from(allSkillIds);

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
        profile.program ?? "Student profile",
    },
  });

  const activities = [
    ...profile.courses.map((course) => ({
      kind: "course" as const,
      item: course,
    })),
    ...profile.experiences.map((experience) => ({
      kind: "experience" as const,
      item: experience,
    })),
  ];

  activities.forEach((activity) => {
    const nodeId =
      `${activity.kind}-${activity.item.id}`;

    if (activity.kind === "course") {
      const relationship =
        getCourseRelationship(activity.item.status);

      nodes.push({
        id: nodeId,
        type: "mova",
        position: {
          x: 0,
          y: 0,
        },
        data: {
          label: activity.item.title,
          category: "course",
          status: getCourseNodeStatus(
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

    nodes.push({
      id: nodeId,
      type: "mova",
      position: {
        x: 0,
        y: 0
      },
      data: {
        label: activity.item.title,
        category: "experience",
        status: getExperienceNodeStatus(
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
        activity.item.status === "completed"
          ? "completed"
          : "working on",
        activity.item.status === "completed"
          ? "created"
          : "pursuing",
      ),
    );

    for (const skillId of activity.item.skillIds) {
      edges.push(
        createEdge(
          `${nodeId}-skill-${skillId}`,
          nodeId,
          `skill-${skillId}`,
          "demonstrates",
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
          getSkillNodeStatus(studentSkill),
        description: roleRequirement
          ? roleRequirement.importance ===
            "required"
            ? "Required for target role"
            : "Preferred for target role"
          : "Demonstrated student skill",
      },
    });

    if (roleRequirement) {
      edges.push(
        createEdge(
          `skill-${skillId}-${roleNodeId}`,
          `skill-${skillId}`,
          roleNodeId,
          roleRequirement.importance ===
            "required"
            ? "required by"
            : "preferred for",
          roleRequirement.importance ===
            "required"
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

  return {
    nodes,
    edges,
  };
}