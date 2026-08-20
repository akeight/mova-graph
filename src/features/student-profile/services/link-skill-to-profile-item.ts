import {
  getEvidenceSkillName,
} from "@/features/goals/data/evidence-skills";
import {
  expandEvidenceImplications,
  normalizeEvidenceNames,
} from "@/features/goals/services/normalize-evidence";

import type {
  StudentCourse,
  StudentExperience,
  StudentProfile,
  StudentSkill,
} from "../types/student-profile";

import { reconcileProfileSkills } from
  "../utils/reconcile-profile-skills";

export type ProfileItemRef = {
  kind: "course" | "experience";
  itemId: string;
};

function cloneProfile(
  profile: StudentProfile,
): StudentProfile {
  return {
    ...profile,
    courses: profile.courses.map((course) => ({
      ...course,
      skillIds: [...course.skillIds],
    })),
    experiences: profile.experiences.map((experience) => ({
      ...experience,
      skillIds: [...experience.skillIds],
    })),
    skills: profile.skills.map((skill) => ({
      ...skill,
    })),
  };
}

function uniqueSkillIds(skillIds: string[]): string[] {
  const nextIds: string[] = [];
  const seen = new Set<string>();

  for (const skillId of skillIds) {
    if (seen.has(skillId)) {
      continue;
    }

    seen.add(skillId);
    nextIds.push(skillId);
  }

  return nextIds;
}

function skillNameFor(
  profile: StudentProfile,
  skillId: string,
): string {
  return (
    profile.skills.find((skill) => skill.id === skillId)?.name ??
    getEvidenceSkillName(skillId)
  );
}

export function expandSkillIdsForLink(
  profile: StudentProfile,
  skillId: string,
): string[] {
  const normalized = normalizeEvidenceNames([
    skillNameFor(profile, skillId),
  ]);
  const expandedIds = normalized.map((skill) => skill.id);

  if (expandedIds.includes(skillId)) {
    return uniqueSkillIds(expandedIds);
  }

  return uniqueSkillIds([skillId, ...expandedIds]);
}

function impliedSkillIds(skillId: string): Set<string> {
  return new Set(
    expandEvidenceImplications(skillId).map((skill) => skill.id),
  );
}

/**
 * Removes a root evidence ID and the deterministic implications produced by
 * that root. Remaining independent roots keep their own expansion, including
 * overlapping implications. Because activity.skillIds are flat, an implication
 * that was also added independently on the same activity is removed too and
 * must be re-added if the student still wants it.
 */
export function unlinkSkillIdsFromActivity(
  skillIds: string[],
  skillId: string,
): string[] {
  if (!skillIds.includes(skillId)) {
    return [...skillIds];
  }

  const impliedByUnlinked = impliedSkillIds(skillId);
  const independentRemaining = skillIds.filter(
    (currentId) =>
      currentId !== skillId && !impliedByUnlinked.has(currentId),
  );

  const nextIds: string[] = [];
  const seen = new Set<string>();

  const remember = (id: string) => {
    if (id === skillId || seen.has(id)) {
      return;
    }

    seen.add(id);
    nextIds.push(id);
  };

  for (const remainingId of independentRemaining) {
    remember(remainingId);

    for (const derived of expandEvidenceImplications(remainingId)) {
      remember(derived.id);
    }
  }

  return nextIds;
}

function mergeSkillMetadata(
  currentSkills: StudentSkill[],
  incomingSkills: Array<{ id: string; name: string }>,
): StudentSkill[] {
  const skillMap = new Map(
    currentSkills.map((skill) => [skill.id, skill]),
  );

  for (const incoming of incomingSkills) {
    const existingSkill = skillMap.get(incoming.id);

    skillMap.set(incoming.id, {
      id: incoming.id,
      name: existingSkill?.name ?? incoming.name,
      status: existingSkill?.status ?? "developing",
      ...(existingSkill?.selfReported
        ? { selfReported: true as const }
        : {}),
    });
  }

  return Array.from(skillMap.values());
}

function findItem(
  profile: StudentProfile,
  item: ProfileItemRef,
): StudentCourse | StudentExperience | undefined {
  if (item.kind === "course") {
    return profile.courses.find((course) => course.id === item.itemId);
  }

  return profile.experiences.find(
    (experience) => experience.id === item.itemId,
  );
}

function replaceItemSkillIds(
  profile: StudentProfile,
  item: ProfileItemRef,
  nextSkillIds: string[],
): StudentProfile {
  if (item.kind === "course") {
    return {
      ...profile,
      courses: profile.courses.map((course) =>
        course.id === item.itemId
          ? {
              ...course,
              skillIds: nextSkillIds,
            }
          : course,
      ),
    };
  }

  return {
    ...profile,
    experiences: profile.experiences.map((experience) =>
      experience.id === item.itemId
        ? {
            ...experience,
            skillIds: nextSkillIds,
          }
        : experience,
    ),
  };
}

export function linkSkillToProfileItem(
  profile: StudentProfile,
  skillId: string,
  item: ProfileItemRef,
): StudentProfile {
  if (!findItem(profile, item)) {
    return profile;
  }

  const cloned = cloneProfile(profile);
  const currentItem = findItem(cloned, item);

  if (!currentItem) {
    return profile;
  }

  const expandedIds = expandSkillIdsForLink(cloned, skillId);
  const nextSkillIds = uniqueSkillIds([
    ...currentItem.skillIds,
    ...expandedIds,
  ]);

  if (
    nextSkillIds.length === currentItem.skillIds.length &&
    nextSkillIds.every((id, index) => id === currentItem.skillIds[index])
  ) {
    return profile;
  }

  const incomingSkills = expandedIds.map((id) => ({
    id,
    name: skillNameFor(cloned, id),
  }));

  return reconcileProfileSkills(
    replaceItemSkillIds(
      {
        ...cloned,
        skills: mergeSkillMetadata(cloned.skills, incomingSkills),
      },
      item,
      nextSkillIds,
    ),
  );
}

export function unlinkSkillFromProfileItem(
  profile: StudentProfile,
  skillId: string,
  item: ProfileItemRef,
): StudentProfile {
  if (!findItem(profile, item)) {
    return profile;
  }

  const cloned = cloneProfile(profile);
  const currentItem = findItem(cloned, item);

  if (!currentItem) {
    return profile;
  }

  const nextSkillIds = unlinkSkillIdsFromActivity(
    currentItem.skillIds,
    skillId,
  );

  if (
    nextSkillIds.length === currentItem.skillIds.length &&
    nextSkillIds.every((id, index) => id === currentItem.skillIds[index])
  ) {
    return profile;
  }

  return reconcileProfileSkills(
    replaceItemSkillIds(cloned, item, nextSkillIds),
  );
}
