import type {
    CourseProgress,
    ExperienceProgress,
    StudentProfile,
    StudentSkill,
  } from "../types/student-profile";
  
  import { reconcileProfileSkills } from
    "../utils/reconcile-profile-skills";
  
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
      }
    | {
        kind: "experience";
        itemId: string;
        title: string;
        description?: string;
        status: ExperienceProgress;
        skillNames: string[];
      };
  
  function createSkillId(
    name: string,
  ): string {
    return name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }
  
  function humanizeSkillId(
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
  
  export function normalizeSkillNames(
    skillNames: string[],
  ): string[] {
    return Array.from(
      new Map(
        skillNames
          .map((name) => name.trim())
          .filter(Boolean)
          .map((name) => [
            createSkillId(name),
            name,
          ]),
      ).values(),
    );
  }
  
  function mergeSkillMetadata(
    currentSkills: StudentSkill[],
    skillNames: string[],
  ): StudentSkill[] {
    const skillMap = new Map(
      currentSkills.map((skill) => [
        skill.id,
        skill,
      ]),
    );
  
    for (const name of skillNames) {
      const id = createSkillId(name);
      const existingSkill =
        skillMap.get(id);
  
      skillMap.set(id, {
        id,
        name,
        status:
          existingSkill?.status ??
          "developing",
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
        humanizeSkillId(skillId),
    );
  }
  
  export function updateProfileItem(
    profile: StudentProfile,
    update: ProfileItemUpdate,
  ): StudentProfile {
    const title = update.title.trim();
  
    const skillNames =
      normalizeSkillNames(
        update.skillNames,
      );
  
    if (!title) {
      throw new Error(
        "A profile item requires a title.",
      );
    }
  
    if (skillNames.length === 0) {
      throw new Error(
        "A profile item requires at least one skill.",
      );
    }
  
    const skillIds = skillNames.map(
      createSkillId,
    );
  
    const profileWithSkillMetadata = {
      ...profile,
  
      skills: mergeSkillMetadata(
        profile.skills,
        skillNames,
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