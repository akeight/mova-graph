import { NextResponse } from "next/server";

import { getAuthenticatedUser } from
  "@/features/auth/services/session";
import { opportunityExtractionInputSchema } from
  "@/features/opportunity-what-if/schemas/opportunity-extraction";
import {
  describeOpportunityExtractionFailure,
  extractOpportunity,
} from "@/features/opportunity-what-if/services/extract-opportunity";
import {
  checkAiRateLimit,
  createRateLimitResponse,
} from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 300;

function withDebug<T extends Record<string, unknown>>(
  body: T,
  debug: ReturnType<typeof describeOpportunityExtractionFailure>,
) {
  if (process.env.NODE_ENV === "production") {
    return body;
  }

  return { ...body, debug };
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json(
      { error: "You must be signed in." },
      { status: 401 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "The request body must be valid JSON." },
      { status: 400 },
    );
  }

  const parsed = opportunityExtractionInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "That opportunity could not be analyzed.",
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const rateLimit = await checkAiRateLimit(request, {
    userId: user.id,
  });

  if (!rateLimit.success) {
    return createRateLimitResponse(rateLimit);
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "AI extraction is not configured." },
      { status: 503 },
    );
  }

  try {
    const extraction = await extractOpportunity(parsed.data);

    return NextResponse.json(extraction);
  } catch (error) {
    const debug = describeOpportunityExtractionFailure(error);

    console.error("Opportunity extraction failed:", debug);

    return NextResponse.json(
      withDebug(
        {
          error:
            "Mova could not analyze that opportunity. Please try again.",
        },
        debug,
      ),
      { status: 500 },
    );
  }
}
