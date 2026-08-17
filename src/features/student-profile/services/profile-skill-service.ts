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

import {
  getEvidenceSkillName,
} from "@/features/goals/data/evidence-skills";

import {
  normalizeEvidenceNames,
} from "@/features/goals/services/normalize-evidence";
  
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
            getEvidenceSkillName(skillId),
  
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
  
  function replaceSkillIdWithExpanded(
    skillIds: string[],
    currentSkillId: string,
    expandedIds: string[],
  ): string[] {
    if (!skillIds.includes(currentSkillId)) {
      return skillIds;
    }

    const nextIds: string[] = [];
    const seen = new Set<string>();

    for (const skillId of skillIds) {
      const replacements =
        skillId === currentSkillId
          ? expandedIds
          : [skillId];

      for (const replacement of replacements) {
        if (!seen.has(replacement)) {
          seen.add(replacement);
          nextIds.push(replacement);
        }
      }
    }

    return nextIds;
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
  
    const normalizedSkills =
      normalizeEvidenceNames([
        normalizedName,
      ]);

    if (normalizedSkills.length === 0) {
      throw new Error(
        "The skill name could not be converted into a valid identifier.",
      );
    }

    const expandedIds = normalizedSkills.map(
      (skill) => skill.id,
    );
    const nextSkillId = expandedIds[0];

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

        skillIds: replaceSkillIdWithExpanded(
          course.skillIds,
          skillId,
          expandedIds,
        ),
      }));

    const updatedExperiences =
      profile.experiences.map(
        (experience) => ({
          ...experience,

          skillIds: replaceSkillIdWithExpanded(
            experience.skillIds,
            skillId,
            expandedIds,
          ),
        }),
      );

    const remainingSkills =
      profile.skills.filter(
        (skill) =>
          !expandedIds.includes(skill.id) &&
          skill.id !== skillId,
      );

    const shouldKeepMetadata =
      currentSkill !== undefined ||
      targetSkill !== undefined ||
      normalizedSkills.length > 0;

    const updatedSkills =
      shouldKeepMetadata
        ? [
            ...remainingSkills,

            ...normalizedSkills.map(
              (skill) => {
                const existing =
                  skill.id === nextSkillId
                    ? targetSkill ?? currentSkill
                    : profile.skills.find(
                        (current) =>
                          current.id === skill.id,
                      );

                return {
                  id: skill.id,
                  name: skill.name,
                  status: mergeSkillStatus(
                    skill.id === nextSkillId
                      ? currentSkill?.status
                      : existing?.status,
                    skill.id === nextSkillId
                      ? targetSkill?.status
                      : existing?.status,
                  ),
                };
              },
            ),
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