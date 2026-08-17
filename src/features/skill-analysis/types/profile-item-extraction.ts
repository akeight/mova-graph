import type {
  CourseProgress,
  ExperienceProgress,
} from "@/features/student-profile/types/student-profile";

import type { EvidenceCategory } from
  "@/features/goals/types/evidence-skill";

import type {
  EvidenceNormalizationMethod,
  EvidenceProvenance,
} from "@/features/goals/types/normalized-evidence";

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
  sourcePhrase?: string;
  confidence: number;
  evidence: string;
  normalizationMethod?: EvidenceNormalizationMethod;
  provenance?: EvidenceProvenance;
  derivedFromSkillId?: string;
  category?: EvidenceCategory;
};

export type ProfileItemExtraction = {
  kind: ProfileItemKind;
  title: string;
  description: string;
  skills: ExtractedSkill[];
};

export type ApprovedProfileItem =
  | {
      kind: "course";
      title: string;
      description?: string;
      status: CourseProgress;
      skills: ExtractedSkill[];
    }
  | {
      kind: "experience";
      title: string;
      description?: string;
      status: ExperienceProgress;
      skills: ExtractedSkill[];
    };
