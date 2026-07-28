export type SkillImportance =
  | "required"
  | "preferred";

export type RoleSkillRequirement = {
  skillId: string;
  skillName: string;
  importance: SkillImportance;
};

export type CareerRole = {
  id: string;
  title: string;
  description?: string;
  requirements: RoleSkillRequirement[];
};