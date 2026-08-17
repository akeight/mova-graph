import type { ExtractedSkill } from
  "@/features/skill-analysis/types/profile-item-extraction";
import type {
  CourseKind,
  ExperienceKind,
} from "@/features/student-profile/types/student-profile";

import type { ResumeItemKind } from
  "../schemas/resume-extraction";

export type { ResumeItemKind };

export type ResumeSource = {
  id: string;
  displayName: string;
};

export type ResumeDraftItem = {
  id: string;
  kind: ResumeItemKind;
  title: string;
  organization?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  status: "completed" | "in-progress";
  skills: ExtractedSkill[];
  selectedSkillIds: string[];
  sourceIds: string[];
  existingItemId?: string;
  existingCollection?: "course" | "experience";
};

export type DuplicateDecision = "merge" | "keep-separate";

export type DuplicateCandidate = {
  id: string;
  leftId: string;
  rightId: string;
  reason: string;
  decision?: DuplicateDecision;
};

export type ResumeImportDraft = {
  sources: ResumeSource[];
  program?: string;
  institution?: string;
  proposedName?: string;
  applyProposedName: boolean;
  items: ResumeDraftItem[];
  standaloneSkills: ExtractedSkill[];
  selectedStandaloneSkillIds: string[];
  possibleDuplicates: DuplicateCandidate[];
};

export type ResumeImportMode = "onboarding" | "later";

export function isCourseKind(
  kind: ResumeItemKind,
): kind is Extract<ResumeItemKind, CourseKind> {
  return kind === "course" || kind === "certification";
}

export function isExperienceKind(
  kind: ResumeItemKind,
): kind is Extract<ResumeItemKind, ExperienceKind> {
  return !isCourseKind(kind);
}
