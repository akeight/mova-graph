import { z } from "zod";

import { rawEvidenceClaimSchema } from
  "@/features/skill-analysis/schemas/profile-item-extraction";
import {
  PROFILE_INSTITUTION_MAX,
  PROFILE_ITEM_DATE_PATTERN,
  PROFILE_ITEM_DESCRIPTION_MAX,
  PROFILE_NAME_MAX,
  PROFILE_ORGANIZATION_MAX,
  PROFILE_PROGRAM_MAX,
  PROFILE_TITLE_MAX,
} from "@/features/student-profile/constants";

import {
  MAX_RESUME_TEXT_CHARS,
  SKILLS_SECTION_EXCERPT_MAX_CHARS,
  SKILLS_SECTION_EXCERPT_MIN_CHARS,
  SOURCE_EXCERPT_MAX_CHARS,
  SOURCE_EXCERPT_MIN_CHARS,
} from "../constants";

export const resumeItemKindSchema = z.enum([
  "work",
  "project",
  "course",
  "certification",
  "volunteer",
  "leadership",
  "other",
]);

export const resumeExtractInputSchema = z.object({
  sourceId: z.string().trim().min(1).max(80),
  displayName: z.string().trim().min(1).max(120),
  text: z
    .string()
    .trim()
    .min(80, "Please provide more resume text.")
    .max(MAX_RESUME_TEXT_CHARS),
});

export const rawResumeItemSchema = z.object({
  kind: resumeItemKindSchema,
  title: z.string().trim().min(1).max(PROFILE_TITLE_MAX),
  organization: z.string().trim().max(PROFILE_ORGANIZATION_MAX).nullable(),
  startDate: z.string().regex(PROFILE_ITEM_DATE_PATTERN).nullable(),
  endDate: z.string().regex(PROFILE_ITEM_DATE_PATTERN).nullable(),
  isCurrent: z.boolean().nullable(),
  description: z
    .string()
    .trim()
    .max(PROFILE_ITEM_DESCRIPTION_MAX)
    .nullable(),
  sourceExcerpt: z
    .string()
    .trim()
    .min(SOURCE_EXCERPT_MIN_CHARS)
    .max(SOURCE_EXCERPT_MAX_CHARS),
  skills: z.array(rawEvidenceClaimSchema).max(16),
});

export const rawResumeExtractionSchema = z.object({
  candidateName: z.string().trim().max(PROFILE_NAME_MAX).nullable(),
  program: z.string().trim().max(PROFILE_PROGRAM_MAX).nullable(),
  institution: z.string().trim().max(PROFILE_INSTITUTION_MAX).nullable(),
  skillsSectionExcerpt: z
    .string()
    .trim()
    .min(SKILLS_SECTION_EXCERPT_MIN_CHARS)
    .max(SKILLS_SECTION_EXCERPT_MAX_CHARS)
    .nullable(),
  items: z.array(rawResumeItemSchema).max(24),
  standaloneSkills: z.array(rawEvidenceClaimSchema).max(24),
});

export type ResumeItemKind = z.infer<typeof resumeItemKindSchema>;
export type RawResumeItem = z.infer<typeof rawResumeItemSchema>;
export type RawResumeExtraction = z.infer<typeof rawResumeExtractionSchema>;
export type ResumeExtractInput = z.infer<typeof resumeExtractInputSchema>;
