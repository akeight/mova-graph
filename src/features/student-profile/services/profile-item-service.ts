import type {
  CourseProgress,
  ExperienceProgress,
  StudentCourse,
  StudentExperience,
  StudentProfile,
  StudentSkill,
} from "../types/student-profile";

import { PROFILE_ITEM_DATE_PATTERN } from
  "../constants";
import { reconcileProfileSkills } from
  "../utils/reconcile-profile-skills";

import {
  getEvidenceSkillName,
} from "@/features/goals/data/evidence-skills";

import {
  normalizeEvidenceNames,
} from "@/features/goals/services/normalize-evidence";

export type ProfileItemKind =
  | "course"
  | "experience";

export type ProfileItemUpdate =
  | {
      kind: "course";
      itemId: string;
      title: string;
      description?: string;
      status: CourseProgress;
      skillNames: string[];
      courseKind?: StudentCourse["kind"];
    }
  | {
      kind: "experience";
      itemId: string;
      title: string;
      description?: string;
      status: ExperienceProgress;
      skillNames: string[];
      experienceKind?: StudentExperience["kind"];
      organization?: string;
      startDate?: string;
      endDate?: string;
    };

export function normalizeSkillNames(
  skillNames: string[],
): string[] {
  return normalizeEvidenceNames(skillNames).map(
    (skill) => skill.name,
  );
}

function mergeSkillMetadata(
  currentSkills: StudentSkill[],
  incomingSkills: Array<{
    id: string;
    name: string;
  }>,
): StudentSkill[] {
  const skillMap = new Map(
    currentSkills.map((skill) => [
      skill.id,
      skill,
    ]),
  );

  for (const incoming of incomingSkills) {
    const existingSkill =
      skillMap.get(incoming.id);

    skillMap.set(incoming.id, {
      id: incoming.id,
      name: incoming.name,
      status:
        existingSkill?.status ??
        "developing",
      ...(existingSkill?.selfReported
        ? { selfReported: true as const }
        : {}),
    });
  }

  return Array.from(
    skillMap.values(),
  );
}

export function getProfileItemSkillNames(
  profile: StudentProfile,
  skillIds: string[],
): string[] {
  const skillMap = new Map(
    profile.skills.map((skill) => [
      skill.id,
      skill.name,
    ]),
  );

  return skillIds.map(
    (skillId) =>
      skillMap.get(skillId) ??
      getEvidenceSkillName(skillId),
  );
}

function persistableDate(value: string | undefined): string | undefined {
  const trimmed = value?.trim();

  if (!trimmed || !PROFILE_ITEM_DATE_PATTERN.test(trimmed)) {
    return undefined;
  }

  return trimmed;
}

export type ProfileItemCreate =
  | {
      kind: "course";
      title: string;
      description?: string;
      status: CourseProgress;
      skillNames: string[];
      courseKind?: StudentCourse["kind"];
    }
  | {
      kind: "experience";
      title: string;
      description?: string;
      status: ExperienceProgress;
      skillNames: string[];
      experienceKind?: StudentExperience["kind"];
      organization?: string;
      startDate?: string;
      endDate?: string;
    };

function createItemId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function addProfileItem(
  profile: StudentProfile,
  create: ProfileItemCreate,
  createId: (prefix: string) => string = createItemId,
): StudentProfile {
  const title = create.title.trim();
  const normalizedSkills = normalizeEvidenceNames(create.skillNames);

  if (!title) {
    throw new Error("A profile item requires a title.");
  }

  if (normalizedSkills.length === 0) {
    throw new Error("A profile item requires at least one skill.");
  }

  const skillIds = normalizedSkills.map((skill) => skill.id);
  const description = create.description?.trim() || undefined;
  const profileWithSkillMetadata = {
    ...profile,
    skills: mergeSkillMetadata(profile.skills, normalizedSkills),
  };

  if (create.kind === "course") {
    return reconcileProfileSkills({
      ...profileWithSkillMetadata,
      courses: [
        ...profile.courses,
        {
          id: createId("course"),
          title,
          description,
          status: create.status,
          skillIds,
          ...(create.courseKind ? { kind: create.courseKind } : {}),
        },
      ],
    });
  }

  return reconcileProfileSkills({
    ...profileWithSkillMetadata,
    experiences: [
      ...profile.experiences,
      {
        id: createId("experience"),
        title,
        description,
        status: create.status,
        skillIds,
        ...(create.experienceKind ? { kind: create.experienceKind } : {}),
        ...(create.organization !== undefined
          ? {
              organization: create.organization.trim() || undefined,
            }
          : {}),
        ...(create.startDate !== undefined
          ? { startDate: persistableDate(create.startDate) }
          : {}),
        ...(create.endDate !== undefined
          ? { endDate: persistableDate(create.endDate) }
          : {}),
      },
    ],
  });
}

export function updateProfileItem(
  profile: StudentProfile,
  update: ProfileItemUpdate,
): StudentProfile {
  const title = update.title.trim();

  const normalizedSkills =
    normalizeEvidenceNames(
      update.skillNames,
    );

  if (!title) {
    throw new Error(
      "A profile item requires a title.",
    );
  }

  if (normalizedSkills.length === 0) {
    throw new Error(
      "A profile item requires at least one skill.",
    );
  }

  const skillIds = normalizedSkills.map(
    (skill) => skill.id,
  );

  const profileWithSkillMetadata = {
    ...profile,

    skills: mergeSkillMetadata(
      profile.skills,
      normalizedSkills,
    ),
  };

  if (update.kind === "course") {
    const courseExists =
      profile.courses.some(
        (course) =>
          course.id === update.itemId,
      );

    if (!courseExists) {
      throw new Error(
        `Course "${update.itemId}" was not found.`,
      );
    }

    return reconcileProfileSkills({
      ...profileWithSkillMetadata,

      courses:
        profile.courses.map(
          (course) =>
            course.id === update.itemId
              ? {
                  ...course,
                  title,
                  description:
                    update.description
                      ?.trim() ||
                    undefined,
                  status: update.status,
                  skillIds,
                  kind:
                    update.courseKind ??
                    course.kind,
                }
              : course,
        ),
    });
  }

  const experienceExists =
    profile.experiences.some(
      (experience) =>
        experience.id ===
        update.itemId,
    );

  if (!experienceExists) {
    throw new Error(
      `Experience "${update.itemId}" was not found.`,
    );
  }

  return reconcileProfileSkills({
    ...profileWithSkillMetadata,

    experiences:
      profile.experiences.map(
        (experience) =>
          experience.id ===
          update.itemId
            ? {
                ...experience,
                title,
                description:
                  update.description
                    ?.trim() ||
                  undefined,
                status: update.status,
                skillIds,
                kind:
                  update.experienceKind ??
                  experience.kind,
                organization:
                  update.organization !== undefined
                    ? update.organization.trim() || undefined
                    : experience.organization,
                startDate:
                  update.startDate !== undefined
                    ? persistableDate(update.startDate)
                    : experience.startDate,
                endDate:
                  update.endDate !== undefined
                    ? persistableDate(update.endDate)
                    : experience.endDate,
              }
            : experience,
      ),
  });
}

export function removeProfileItem(
  profile: StudentProfile,
  kind: ProfileItemKind,
  itemId: string,
): StudentProfile {
  const nextProfile =
    kind === "course"
      ? {
          ...profile,

          courses:
            profile.courses.filter(
              (course) =>
                course.id !== itemId,
            ),
        }
      : {
          ...profile,

          experiences:
            profile.experiences.filter(
              (experience) =>
                experience.id !==
                itemId,
            ),
        };

  return reconcileProfileSkills(
    nextProfile,
  );
}
