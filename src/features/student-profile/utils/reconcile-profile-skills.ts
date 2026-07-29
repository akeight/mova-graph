import type {
    StudentProfile,
    StudentSkill,
  } from "../types/student-profile";
  
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
  
  export function reconcileProfileSkills(
    profile: StudentProfile,
  ): StudentProfile {
    const activeSkillStatuses = new Map<
      string,
      StudentSkill["status"]
    >();
  
    for (const course of profile.courses) {
      const status: StudentSkill["status"] =
        course.status === "completed"
          ? "demonstrated"
          : "developing";
  
      for (const skillId of course.skillIds) {
        activeSkillStatuses.set(
          skillId,
          mergeStatus(
            activeSkillStatuses.get(skillId),
            status,
          ),
        );
      }
    }
  
    for (const experience of profile.experiences) {
      const status: StudentSkill["status"] =
        experience.status === "completed"
          ? "demonstrated"
          : "developing";
  
      for (const skillId of experience.skillIds) {
        activeSkillStatuses.set(
          skillId,
          mergeStatus(
            activeSkillStatuses.get(skillId),
            status,
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
  
    const reconciledSkills = Array.from(
      activeSkillStatuses.entries(),
    ).map(([skillId, status]) => {
      const existingSkill = skillById.get(skillId);
  
      return {
        id: skillId,
        name:
          existingSkill?.name ??
          skillId
            .split("-")
            .map(
              (word) =>
                word.charAt(0).toUpperCase() +
                word.slice(1),
            )
            .join(" "),
        status,
      } satisfies StudentSkill;
    });
  
    return {
      ...profile,
      skills: reconciledSkills,
    };
  }