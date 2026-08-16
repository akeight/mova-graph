import { z } from "zod";

export const profileItemExtractionInputSchema =
  z.object({
    kind: z.enum([
      "course",
      "experience",
    ]),

    text: z
      .string()
      .trim()
      .min(
        20,
        "Please provide at least 20 characters.",
      )
      .max(
        5_000,
        "The description must be 5,000 characters or fewer.",
      ),
  });

export const rawEvidenceMappingSchema =
  z.object({
    canonicalSkillId: z
      .string()
      .trim()
      .min(1)
      .max(80)
      .describe(
        "A MOVa evidence catalog ID supported by this source phrase.",
      ),

    confidence: z
      .number()
      .min(0)
      .max(1)
      .describe(
        "How strongly the source supports this evidence. Not mapping certainty or proficiency.",
      ),
  });

export const rawProfileItemExtractionSchema =
  z.object({
    title: z
      .string()
      .trim()
      .min(1)
      .max(120)
      .describe(
        "A concise title for the course or experience.",
      ),

    description: z
      .string()
      .trim()
      .min(1)
      .max(400)
      .describe(
        "A concise factual summary based only on the supplied text.",
      ),

    skills: z
      .array(
        z.object({
          sourcePhrase: z
            .string()
            .trim()
            .min(1)
            .max(120)
            .describe(
              "A short phrase copied from the student source. Must be grounded in that source.",
            ),

          evidence: z
            .string()
            .trim()
            .min(1)
            .max(200)
            .describe(
              "What in the source supports these mappings. Must stay grounded in student text.",
            ),

          mappings: z
            .array(rawEvidenceMappingSchema)
            .max(8)
            .describe(
              "Canonical catalog mappings. May be empty when the phrase is unknown evidence.",
            ),
        }),
      )
      .min(1)
      .max(8),
  });

export type RawProfileItemExtraction =
  z.infer<
    typeof rawProfileItemExtractionSchema
  >;
