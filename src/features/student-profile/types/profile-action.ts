export type QuickAddType =
  | "experience"
  | "project"
  | "course"
  | "certification"
  | "skill";

export type ProfileAction =
  | {
      mode: "quick-add";
      itemType?: QuickAddType;
      skillIds?: string[];
      returnTo?: {
        mode: "manage-skill-evidence";
        skillId: string;
        intent?: "add" | "manage";
      };
    }
  | {
      mode: "manage-skill-evidence";
      skillId: string;
      intent?: "add" | "manage";
    }
  | {
      mode: "edit-activity";
      itemKind: "course" | "experience";
      itemId: string;
    };

export function contextualSkillIds(
  skillIds: string[] | undefined,
): string[] {
  return skillIds?.filter((skillId) => skillId.trim().length > 0) ?? [];
}

export function quickAddSkillContext(
  skillIds: string[] | undefined,
): "none" | "single" | "multiple" {
  const ids = contextualSkillIds(skillIds);

  if (ids.length === 0) {
    return "none";
  }

  if (ids.length === 1) {
    return "single";
  }

  return "multiple";
}

export function profileActionForSuggestedEvidence(
  skillIds: string[],
): ProfileAction {
  const ids = contextualSkillIds(skillIds);

  if (ids.length === 1 && ids[0]) {
    return {
      mode: "manage-skill-evidence",
      skillId: ids[0],
      intent: "add",
    };
  }

  if (ids.length > 1) {
    return {
      mode: "quick-add",
      skillIds: ids,
    };
  }

  return { mode: "quick-add" };
}
