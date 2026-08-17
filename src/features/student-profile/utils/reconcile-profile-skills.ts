import {
  expandEvidenceImplications,
} from "@/features/goals/services/normalize-evidence";
import {
  getEvidenceSkillName,
} from "@/features/goals/data/evidence-skills";

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
  const registryName = getEvidenceSkillName(skillId);

  if (registryName !== skillId) {
    return registryName;
  }

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
  const statuses = new Map<string, StudentSkill["status"]>();
  const names = new Map<string, string>();
  const selfReportedRoots = new Set<string>();

  const existingById = new Map(
    profile.skills.map((skill) => [skill.id, skill]),
  );

  const rememberName = (skillId: string, name?: string) => {
    if (names.has(skillId)) {
      return;
    }

    names.set(
      skillId,
      name ??
        existingById.get(skillId)?.name ??
        createSkillName(skillId),
    );
  };

  const contribute = (
    skillId: string,
    status: StudentSkill["status"],
    name?: string,
  ) => {
    rememberName(skillId, name);
    statuses.set(
      skillId,
      mergeStatus(statuses.get(skillId), status),
    );
  };

  const activities = [
    ...profile.courses,
    ...profile.experiences,
  ];

  for (const activity of activities) {
    const contributionStatus =
      getSkillContributionStatus(activity.status);

    if (!contributionStatus) {
      continue;
    }

    for (const skillId of activity.skillIds) {
      contribute(skillId, contributionStatus);
    }
  }

  for (const skill of profile.skills) {
    if (skill.selfReported !== true) {
      continue;
    }

    selfReportedRoots.add(skill.id);
    contribute(skill.id, "developing", skill.name);

    for (const derived of expandEvidenceImplications(
      skill.id,
      skill.name,
    )) {
      contribute(derived.id, "developing", derived.name);
    }
  }

  const reconciledSkills = Array.from(statuses.entries()).map(
    ([skillId, status]) => {
      const skill: StudentSkill = {
        id: skillId,
        name: names.get(skillId) ?? createSkillName(skillId),
        status,
      };

      if (selfReportedRoots.has(skillId)) {
        skill.selfReported = true;
      }

      return skill;
    },
  );

  return {
    ...profile,
    skills: reconciledSkills,
  };
}
