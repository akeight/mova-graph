import { studentProfileSchema } from
  "@/features/persistence/schemas/workspace";
import {
  PROFILE_ITEM_DATE_PATTERN,
  PROFILE_ITEM_DESCRIPTION_MAX,
} from "@/features/student-profile/constants";
import { addSelfReportedSkills } from
  "@/features/student-profile/services/profile-self-reported-skill-service";
import type {
  StudentCourse,
  StudentExperience,
  StudentProfile,
} from "@/features/student-profile/types/student-profile";
import { reconcileProfileSkills } from
  "@/features/student-profile/utils/reconcile-profile-skills";

import type {
  ResumeDraftItem,
  ResumeImportDraft,
  ResumeImportMode,
} from "../types/resume-import";
import { isCourseKind } from "../types/resume-import";

import { combineProfileDescriptions } from
  "./combine-profile-descriptions";
import { approvedSkillIdsFromSelection } from
  "./resume-draft-skills";

export class ResumeDraftApplyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ResumeDraftApplyError";
  }
}

function createItemId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

function uniqueSkillIds(skillIds: string[]): string[] {
  return Array.from(new Set(skillIds));
}

function persistableDescription(value: string | undefined): string | undefined {
  const trimmed = value?.trim();

  if (!trimmed) {
    return undefined;
  }

  return trimmed.slice(0, PROFILE_ITEM_DESCRIPTION_MAX);
}

function persistableDate(value: string | undefined): string | undefined {
  const trimmed = value?.trim();

  if (!trimmed || !PROFILE_ITEM_DATE_PATTERN.test(trimmed)) {
    return undefined;
  }

  return trimmed;
}

function approvedItemSkillIds(item: ResumeDraftItem): string[] {
  return uniqueSkillIds(
    approvedSkillIdsFromSelection(item.skills, item.selectedSkillIds),
  );
}

function draftToCourse(item: ResumeDraftItem): StudentCourse {
  return {
    id: createItemId("course"),
    title: item.title.trim(),
    description: persistableDescription(item.description),
    status: item.status,
    skillIds: approvedItemSkillIds(item),
    kind: isCourseKind(item.kind) ? item.kind : "course",
  };
}

function draftToExperience(item: ResumeDraftItem): StudentExperience {
  return {
    id: createItemId("experience"),
    title: item.title.trim(),
    description: persistableDescription(item.description),
    status: item.status,
    skillIds: approvedItemSkillIds(item),
    kind: isCourseKind(item.kind) ? "work" : item.kind,
    organization: item.organization?.trim() || undefined,
    startDate: persistableDate(item.startDate),
    endDate: persistableDate(item.endDate),
  };
}

function unionExistingCourse(
  course: StudentCourse,
  item: ResumeDraftItem,
): StudentCourse {
  return {
    ...course,
    description:
      persistableDescription(course.description) ||
      persistableDescription(
        combineProfileDescriptions(course.description, item.description),
      ),
    skillIds: uniqueSkillIds([
      ...course.skillIds,
      ...approvedItemSkillIds(item),
    ]),
    kind: course.kind ?? (isCourseKind(item.kind) ? item.kind : "course"),
  };
}

function unionExistingExperience(
  experience: StudentExperience,
  item: ResumeDraftItem,
): StudentExperience {
  return {
    ...experience,
    description:
      persistableDescription(experience.description) ||
      persistableDescription(
        combineProfileDescriptions(
          experience.description,
          item.description,
        ),
      ),
    skillIds: uniqueSkillIds([
      ...experience.skillIds,
      ...approvedItemSkillIds(item),
    ]),
    kind: experience.kind ?? (isCourseKind(item.kind) ? "work" : item.kind),
    organization:
      experience.organization?.trim() ||
      item.organization?.trim() ||
      undefined,
    startDate:
      persistableDate(experience.startDate) ??
      persistableDate(item.startDate),
    endDate:
      persistableDate(experience.endDate) ?? persistableDate(item.endDate),
  };
}

export function applyResumeDraftToProfile(
  baseline: StudentProfile,
  draft: ResumeImportDraft,
  mode: ResumeImportMode,
): StudentProfile {
  let nextProfile: StudentProfile = structuredClone(baseline);

  if (
    draft.applyProposedName &&
    draft.proposedName?.trim() &&
    (mode === "onboarding" || draft.applyProposedName)
  ) {
    nextProfile = {
      ...nextProfile,
      name: draft.proposedName.trim(),
    };
  }

  if (!nextProfile.program && draft.program) {
    nextProfile = { ...nextProfile, program: draft.program };
  }

  if (!nextProfile.institution && draft.institution) {
    nextProfile = { ...nextProfile, institution: draft.institution };
  }

  for (const item of draft.items) {
    if (item.existingItemId && item.existingCollection === "course") {
      nextProfile = {
        ...nextProfile,
        courses: nextProfile.courses.map((course) =>
          course.id === item.existingItemId
            ? unionExistingCourse(course, item)
            : course,
        ),
      };
      continue;
    }

    if (item.existingItemId && item.existingCollection === "experience") {
      nextProfile = {
        ...nextProfile,
        experiences: nextProfile.experiences.map((experience) =>
          experience.id === item.existingItemId
            ? unionExistingExperience(experience, item)
            : experience,
        ),
      };
      continue;
    }

    if (isCourseKind(item.kind)) {
      nextProfile = {
        ...nextProfile,
        courses: [...nextProfile.courses, draftToCourse(item)],
      };
      continue;
    }

    nextProfile = {
      ...nextProfile,
      experiences: [...nextProfile.experiences, draftToExperience(item)],
    };
  }

  const selectedStandaloneIds = new Set(draft.selectedStandaloneSkillIds);
  const standaloneNames = draft.standaloneSkills
    .filter(
      (skill) =>
        selectedStandaloneIds.has(skill.id) &&
        skill.provenance !== "derived",
    )
    .map((skill) => skill.name);

  if (standaloneNames.length > 0) {
    nextProfile = addSelfReportedSkills(nextProfile, standaloneNames);
  } else {
    nextProfile = reconcileProfileSkills(nextProfile);
  }

  const parsed = studentProfileSchema.safeParse(nextProfile);

  if (!parsed.success) {
    throw new ResumeDraftApplyError(
      "The imported profile could not be saved. Please review your draft and try again.",
    );
  }

  return parsed.data;
}
