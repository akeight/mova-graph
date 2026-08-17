import {
  resolveEvidenceTerm,
} from "@/features/goals/services/normalize-evidence";

import type { StudentProfile } from "../types/student-profile";

import { reconcileProfileSkills } from
  "../utils/reconcile-profile-skills";

function withSelfReportedRoot(
  profile: StudentProfile,
  skillId: string,
  name: string,
): StudentProfile {
  const remaining = profile.skills.filter(
    (skill) => skill.id !== skillId,
  );

  const existing = profile.skills.find(
    (skill) => skill.id === skillId,
  );

  return {
    ...profile,
    skills: [
      ...remaining,
      {
        id: skillId,
        name: existing?.name ?? name,
        status: existing?.status ?? "developing",
        selfReported: true,
      },
    ],
  };
}

export function addSelfReportedSkills(
  profile: StudentProfile,
  skillNames: string[],
): StudentProfile {
  let nextProfile = profile;

  for (const rawName of skillNames) {
    const trimmed = rawName.trim();

    if (!trimmed) {
      continue;
    }

    const resolved = resolveEvidenceTerm(trimmed);

    nextProfile = withSelfReportedRoot(
      nextProfile,
      resolved.direct.id,
      resolved.direct.name,
    );
  }

  return reconcileProfileSkills(nextProfile);
}

export function removeSelfReportedSkill(
  profile: StudentProfile,
  skillId: string,
): StudentProfile {
  const nextSkills = profile.skills.map((skill) => {
    if (skill.id !== skillId) {
      return skill;
    }

    const { selfReported: _removed, ...rest } = skill;
    void _removed;

    return rest;
  });

  return reconcileProfileSkills({
    ...profile,
    skills: nextSkills,
  });
}

export function renameSelfReportedSkill(
  profile: StudentProfile,
  skillId: string,
  nextName: string,
): StudentProfile {
  const trimmed = nextName.trim();

  if (!trimmed) {
    throw new Error("A skill requires a name.");
  }

  const withoutOldRoot = removeSelfReportedSkill(
    profile,
    skillId,
  );

  return addSelfReportedSkills(withoutOldRoot, [trimmed]);
}
