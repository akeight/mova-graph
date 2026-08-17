import type { EvidenceCategory } from "./evidence-skill";

export type EvidenceNormalizationMethod =
  | "exact-id"
  | "exact-name"
  | "alias"
  | "derived"
  | "semantic"
  | "unmapped";

export type EvidenceProvenance = "direct" | "derived";

export type NormalizedEvidenceSkill = {
  id: string;
  name: string;
  sourcePhrase: string;
  method: EvidenceNormalizationMethod;
  provenance: EvidenceProvenance;
  category?: EvidenceCategory;
  derivedFromSkillId?: string;
};

export type NormalizedEvidenceResult = {
  sourcePhrase: string;
  direct: NormalizedEvidenceSkill;
  derived: NormalizedEvidenceSkill[];
};
