import { NextResponse } from "next/server";

import { getAuthenticatedUser } from
  "@/features/auth/services/session";
import { resumeExtractInputSchema } from
  "@/features/resume-import/schemas/resume-extraction";
import {
  describeResumeExtractionFailure,
  extractResume,
  ResumeExtractionEmptyError,
} from "@/features/resume-import/services/extract-resume";
import {
  checkAiRateLimit,
  createRateLimitResponse,
} from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 300;

function withDebug<T extends Record<string, unknown>>(
  body: T,
  debug: ReturnType<typeof describeResumeExtractionFailure>,
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

  const parsed = resumeExtractInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "That resume could not be analyzed.",
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
    const draft = await extractResume(parsed.data);

    return NextResponse.json(draft);
  } catch (error) {
    const debug = describeResumeExtractionFailure(error);

    console.error("Resume extraction failed:", debug);

    if (error instanceof ResumeExtractionEmptyError) {
      return NextResponse.json(
        withDebug({ error: error.message }, debug),
        { status: 422 },
      );
    }

    return NextResponse.json(
      withDebug(
        {
          error:
            "Mova could not analyze that resume. Please try again.",
        },
        debug,
      ),
      { status: 500 },
    );
  }
}
