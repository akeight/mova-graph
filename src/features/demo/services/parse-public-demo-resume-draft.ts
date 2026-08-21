import { z } from "zod";

import { resumeItemKindSchema } from
  "@/features/resume-import/schemas/resume-extraction";
import type { ResumeImportDraft } from
  "@/features/resume-import/types/resume-import";

const extractedSkillSchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1),
  sourcePhrase: z.string().optional(),
  confidence: z.number(),
  evidence: z.string(),
  normalizationMethod: z.string().optional(),
  provenance: z.enum(["direct", "derived"]).optional(),
  derivedFromSkillId: z.string().optional(),
  category: z.enum(["technology", "capability"]).optional(),
});

const resumeDraftItemSchema = z.object({
  id: z.string().trim().min(1),
  kind: resumeItemKindSchema,
  title: z.string().trim().min(1),
  organization: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(["completed", "in-progress"]),
  skills: z.array(extractedSkillSchema),
  selectedSkillIds: z.array(z.string()),
  sourceIds: z.array(z.string()),
  existingItemId: z.string().optional(),
  existingCollection: z.enum(["course", "experience"]).optional(),
});

const publicDemoResumeDraftSchema = z.object({
  sources: z.array(
    z.object({
      id: z.string().trim().min(1),
      displayName: z.string().trim().min(1),
    }),
  ).min(1),
  program: z.string().optional(),
  institution: z.string().optional(),
  proposedName: z.string().optional(),
  applyProposedName: z.boolean(),
  items: z.array(resumeDraftItemSchema),
  standaloneSkills: z.array(extractedSkillSchema),
  selectedStandaloneSkillIds: z.array(z.string()),
  possibleDuplicates: z.array(
    z.object({
      id: z.string().trim().min(1),
      leftId: z.string().trim().min(1),
      rightId: z.string().trim().min(1),
      reason: z.string(),
      decision: z.enum(["merge", "keep-separate"]).optional(),
    }),
  ),
});

export function parsePublicDemoResumeDraft(
  value: unknown,
): ResumeImportDraft | null {
  const parsed = publicDemoResumeDraftSchema.safeParse(value);

  if (!parsed.success) {
    return null;
  }

  return parsed.data as ResumeImportDraft;
}
