import { NextResponse } from "next/server";

import {
  profileItemExtractionInputSchema,
} from "@/features/skill-analysis/schemas/profile-item-extraction";

import {
  extractProfileItem,
} from "@/features/skill-analysis/services/extract-profile-item";

export const runtime = "nodejs";

export async function POST(
  request: Request,
) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        error:
          "The request body must be valid JSON.",
      },
      {
        status: 400,
      },
    );
  }

  const parsed =
    profileItemExtractionInputSchema.safeParse(
      body,
    );

  if (!parsed.success) {
    return NextResponse.json(
      {
        error:
          "The profile item could not be analyzed.",
        issues:
          parsed.error.flatten()
            .fieldErrors,
      },
      {
        status: 400,
      },
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      {
        error:
          "AI extraction is not configured.",
      },
      {
        status: 503,
      },
    );
  }

  try {
    const extraction =
      await extractProfileItem(
        parsed.data,
      );

    return NextResponse.json(
      extraction,
    );
  } catch (error) {
    console.error(
      "Profile extraction failed:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Mova could not analyze that description. Please try again.",
      },
      {
        status: 500,
      },
    );
  }
}