export type ProfileItemKind =
  | "course"
  | "experience";

export type ProfileItemExtractionInput = {
  kind: ProfileItemKind;
  text: string;
};

export type ExtractedSkill = {
  id: string;
  name: string;
  confidence: number;
  evidence: string;
};

export type ProfileItemExtraction = {
  kind: ProfileItemKind;
  title: string;
  description: string;
  skills: ExtractedSkill[];
};