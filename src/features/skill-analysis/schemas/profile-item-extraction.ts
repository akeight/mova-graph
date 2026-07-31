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
          name: z
            .string()
            .trim()
            .min(1)
            .max(60)
            .describe(
              "A concise canonical skill name.",
            ),

          confidence: z
            .number()
            .min(0)
            .max(1)
            .describe(
              "Confidence that the supplied text provides evidence for this skill.",
            ),

          evidence: z
            .string()
            .trim()
            .min(1)
            .max(200)
            .describe(
              "A short explanation of what in the text supports this skill.",
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