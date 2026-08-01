import type {
    StudentProfile,
    StudentSkill,
  } from "../types/student-profile";
  
  import type { ProfileItemProgress } from
    "../utils/profile-item-status";
  
  import {
    getSkillContributionStatus,
  } from "../utils/profile-item-status";
  
  import { reconcileProfileSkills } from
    "../utils/reconcile-profile-skills";
  
  export type ManagedSkillStatus =
    | StudentSkill["status"]
    | "planned"
    | "inactive";
  
  export type SkillEvidenceSource = {
    kind: "course" | "experience";
    itemId: string;
    title: string;
    status: ProfileItemProgress;
  };
  
  export type ManagedProfileSkill = {
    id: string;
    name: string;
    status: ManagedSkillStatus;
    sources: SkillEvidenceSource[];
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
  
  function determineSkillStatus(
    sources: SkillEvidenceSource[],
    existingSkill?: StudentSkill,
  ): ManagedSkillStatus {
    const contributionStatuses =
      sources
        .map((source) =>
          getSkillContributionStatus(
            source.status,
          ),
        )
        .filter(
          (
            status,
          ): status is StudentSkill["status"] =>
            status !== null,
        );
  
    if (
      contributionStatuses.includes(
        "demonstrated",
      )
    ) {
      return "demonstrated";
    }
  
    if (
      contributionStatuses.includes(
        "developing",
      )
    ) {
      return "developing";
    }
  
    if (
      sources.some(
        (source) =>
          source.status === "planned",
      )
    ) {
      return "planned";
    }
  
    if (sources.length > 0) {
      return "inactive";
    }
  
    return (
      existingSkill?.status ??
      "inactive"
    );
  }
  
  export function getManagedProfileSkills(
    profile: StudentProfile,
  ): ManagedProfileSkill[] {
    const skillMetadata = new Map(
      profile.skills.map((skill) => [
        skill.id,
        skill,
      ]),
    );
  
    const sourcesBySkillId = new Map<
      string,
      SkillEvidenceSource[]
    >();
  
    const addSource = (
      skillId: string,
      source: SkillEvidenceSource,
    ) => {
      const existingSources =
        sourcesBySkillId.get(skillId) ??
        [];
  
      sourcesBySkillId.set(skillId, [
        ...existingSources,
        source,
      ]);
    };
  
    for (const course of profile.courses) {
      for (const skillId of course.skillIds) {
        addSource(skillId, {
          kind: "course",
          itemId: course.id,
          title: course.title,
          status: course.status,
        });
      }
    }
  
    for (
      const experience of
      profile.experiences
    ) {
      for (
        const skillId of
        experience.skillIds
      ) {
        addSource(skillId, {
          kind: "experience",
          itemId: experience.id,
          title: experience.title,
          status: experience.status,
        });
      }
    }
  
    const allSkillIds = new Set([
      ...skillMetadata.keys(),
      ...sourcesBySkillId.keys(),
    ]);
  
    return Array.from(allSkillIds)
      .map((skillId) => {
        const existingSkill =
          skillMetadata.get(skillId);
  
        const sources =
          sourcesBySkillId.get(
            skillId,
          ) ?? [];
  
        return {
          id: skillId,
  
          name:
            existingSkill?.name ??
            humanizeSkillId(skillId),
  
          status:
            determineSkillStatus(
              sources,
              existingSkill,
            ),
  
          sources,
        };
      })
      .sort((left, right) =>
        left.name.localeCompare(
          right.name,
        ),
      );
  }
  
  function replaceSkillId(
    skillIds: string[],
    currentSkillId: string,
    nextSkillId: string,
  ): string[] {
    return Array.from(
      new Set(
        skillIds.map((skillId) =>
          skillId === currentSkillId
            ? nextSkillId
            : skillId,
        ),
      ),
    );
  }
  
  function mergeSkillStatus(
    first:
      | StudentSkill["status"]
      | undefined,
    second:
      | StudentSkill["status"]
      | undefined,
  ): StudentSkill["status"] {
    if (
      first === "demonstrated" ||
      second === "demonstrated"
    ) {
      return "demonstrated";
    }
  
    return "developing";
  }
  
  export function renameProfileSkill(
    profile: StudentProfile,
    skillId: string,
    nextName: string,
  ): StudentProfile {
    const normalizedName =
      nextName.trim();
  
    if (!normalizedName) {
      throw new Error(
        "A skill requires a name.",
      );
    }
  
    const nextSkillId =
      createSkillId(normalizedName);
  
    if (!nextSkillId) {
      throw new Error(
        "The skill name could not be converted into a valid identifier.",
      );
    }
  
    const skillExists =
      getManagedProfileSkills(
        profile,
      ).some(
        (skill) =>
          skill.id === skillId,
      );
  
    if (!skillExists) {
      throw new Error(
        `Skill "${skillId}" was not found.`,
      );
    }
  
    const currentSkill =
      profile.skills.find(
        (skill) =>
          skill.id === skillId,
      );
  
    const targetSkill =
      profile.skills.find(
        (skill) =>
          skill.id === nextSkillId,
      );
  
    const updatedCourses =
      profile.courses.map((course) => ({
        ...course,
  
        skillIds: replaceSkillId(
          course.skillIds,
          skillId,
          nextSkillId,
        ),
      }));
  
    const updatedExperiences =
      profile.experiences.map(
        (experience) => ({
          ...experience,
  
          skillIds: replaceSkillId(
            experience.skillIds,
            skillId,
            nextSkillId,
          ),
        }),
      );
  
    const remainingSkills =
      profile.skills.filter(
        (skill) =>
          skill.id !== skillId &&
          skill.id !== nextSkillId,
      );
  
    const shouldKeepMetadata =
      currentSkill !== undefined ||
      targetSkill !== undefined;
  
    const updatedSkills =
      shouldKeepMetadata
        ? [
            ...remainingSkills,
  
            {
              id: nextSkillId,
              name: normalizedName,
  
              status:
                mergeSkillStatus(
                  currentSkill?.status,
                  targetSkill?.status,
                ),
            },
          ]
        : remainingSkills;
  
    return reconcileProfileSkills({
      ...profile,
      courses: updatedCourses,
      experiences:
        updatedExperiences,
      skills: updatedSkills,
    });
  }
  
  export function removeProfileSkill(
    profile: StudentProfile,
    skillId: string,
  ): StudentProfile {
    const updatedProfile: StudentProfile = {
      ...profile,
  
      courses: profile.courses.map(
        (course) => ({
          ...course,
  
          skillIds:
            course.skillIds.filter(
              (currentSkillId) =>
                currentSkillId !==
                skillId,
            ),
        }),
      ),
  
      experiences:
        profile.experiences.map(
          (experience) => ({
            ...experience,
  
            skillIds:
              experience.skillIds.filter(
                (currentSkillId) =>
                  currentSkillId !==
                  skillId,
              ),
          }),
        ),
  
      skills: profile.skills.filter(
        (skill) =>
          skill.id !== skillId,
      ),
    };
  
    return reconcileProfileSkills(
      updatedProfile,
    );
  }