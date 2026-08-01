import type {
  StudentProfile,
  StudentSkill,
} from "../types/student-profile";

import { getSkillContributionStatus } from
  "./profile-item-status";

function mergeStatus(
  current: StudentSkill["status"] | undefined,
  incoming: StudentSkill["status"],
): StudentSkill["status"] {
  if (
    current === "demonstrated" ||
    incoming === "demonstrated"
  ) {
    return "demonstrated";
  }

  return "developing";
}

function createSkillName(
  skillId: string,
): string {
  return skillId
    .split("-")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1),
    )
    .join(" ");
}

export function reconcileProfileSkills(
  profile: StudentProfile,
): StudentProfile {
  const activeSkillStatuses = new Map<
    string,
    StudentSkill["status"]
  >();

  const activities = [
    ...profile.courses,
    ...profile.experiences,
  ];

  for (const activity of activities) {
    const contributionStatus =
      getSkillContributionStatus(
        activity.status,
      );

    if (!contributionStatus) {
      continue;
    }

    for (const skillId of activity.skillIds) {
      activeSkillStatuses.set(
        skillId,
        mergeStatus(
          activeSkillStatuses.get(skillId),
          contributionStatus,
        ),
      );
    }
  }

  const skillById = new Map(
    profile.skills.map((skill) => [
      skill.id,
      skill,
    ]),
  );

  const reconciledSkills =
    Array.from(
      activeSkillStatuses.entries(),
    ).map(([skillId, status]) => {
      const existingSkill =
        skillById.get(skillId);

      return {
        id: skillId,
        name:
          existingSkill?.name ??
          createSkillName(skillId),
        status,
      } satisfies StudentSkill;
    });

  return {
    ...profile,
    skills: reconciledSkills,
  };
}