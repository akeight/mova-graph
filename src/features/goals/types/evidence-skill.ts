export type EvidenceCategory =
  | "technology"
  | "capability";

/*
 * Registry entries may be concrete technologies (React, PostgreSQL)
 * or broader demonstrated engineering capabilities (frontend-development).
 * Both are first-class evidence; technologies are not the only valid signal.
 */
export type EvidenceSkillDefinition = {
  id: string;
  name: string;
  category: EvidenceCategory;
  aliases?: string[];
};
