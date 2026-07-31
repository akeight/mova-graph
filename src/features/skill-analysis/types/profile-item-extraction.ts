import type {
  CourseProgress,
  ExperienceProgress,
} from "@/features/student-profile/types/student-profile";

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