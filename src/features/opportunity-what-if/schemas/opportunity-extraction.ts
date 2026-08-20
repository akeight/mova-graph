import { z } from "zod";

import {
  rawEvidenceClaimSchema,
} from "@/features/skill-analysis/schemas/profile-item-extraction";

import {
  MAX_OPPORTUNITY_CLAIMS,
  MAX_OPPORTUNITY_TEXT_CHARS,
  MIN_OPPORTUNITY_TEXT_CHARS,
} from "../constants";
import { opportunityTypes } from "../types/opportunity-what-if";

export const opportunityTypeSchema = z.enum(opportunityTypes);

export const opportunityExtractionInputSchema = z.object({
  opportunityType: opportunityTypeSchema,
  text: z
    .string()
    .trim()
    .min(
      MIN_OPPORTUNITY_TEXT_CHARS,
      "Please provide at least 20 characters.",
    )
    .max(
      MAX_OPPORTUNITY_TEXT_CHARS,
      "The description must be 5,000 characters or fewer.",
    ),
});

export const opportunityClaimContextSchema = z
  .enum(["developable", "prerequisite"])
  .describe(
    "developable = work the student would perform or learn. prerequisite = qualifications the employer expects before starting. Prerequisites must not become projected evidence.",
  );

export const rawOpportunityEvidenceClaimSchema =
  rawEvidenceClaimSchema.extend({
    context: opportunityClaimContextSchema,
  });

export const rawOpportunityExtractionSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .describe("A concise title for the opportunity."),
  description: z
    .string()
    .trim()
    .min(1)
    .max(400)
    .describe(
      "A concise factual summary based only on the supplied text.",
    ),
  skills: z
    .array(rawOpportunityEvidenceClaimSchema)
    .max(MAX_OPPORTUNITY_CLAIMS)
    .describe(
      "Evidence claims. Label each as developable or prerequisite.",
    ),
});

export type OpportunityExtractionInput = z.infer<
  typeof opportunityExtractionInputSchema
>;

export type RawOpportunityEvidenceClaim = z.infer<
  typeof rawOpportunityEvidenceClaimSchema
>;

export type RawOpportunityExtraction = z.infer<
  typeof rawOpportunityExtractionSchema
>;
