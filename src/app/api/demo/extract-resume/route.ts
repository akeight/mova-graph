import { NextResponse } from "next/server";

import {
  DEMO_RESUME_DISPLAY_NAME,
  DEMO_RESUME_SOURCE_ID,
  DEMO_RESUME_TEXT,
} from "@/features/demo/data/demo-resume";
import { isAcceptablePublicDemoResumeDraft } from
  "@/features/demo/services/demo-live-resume-guard";
import {
  DEMO_LIVE_EXTRACTION_HEADER,
  DEMO_LIVE_EXTRACTION_VALUE,
} from "@/features/demo/runtime/demo-live-extraction";
import {
  describeResumeExtractionFailure,
  extractResume,
  ResumeExtractionEmptyError,
} from "@/features/resume-import/services/extract-resume";
import {
  checkDemoAiRateLimit,
  createDemoAiRateLimitResponse,
} from "@/lib/demo-ai-rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

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
  try {
    await request.text();
  } catch {
    // The public demo ignores the request body. Drain it so callers cannot
    // supply resume text, then continue with the committed sample.
  }

  const rateLimit = await checkDemoAiRateLimit(request);

  if (!rateLimit.success) {
    return createDemoAiRateLimitResponse(rateLimit);
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "AI extraction is not configured." },
      { status: 503 },
    );
  }

  try {
    const draft = await extractResume({
      sourceId: DEMO_RESUME_SOURCE_ID,
      displayName: DEMO_RESUME_DISPLAY_NAME,
      text: DEMO_RESUME_TEXT,
    });

    if (!isAcceptablePublicDemoResumeDraft(draft)) {
      return NextResponse.json(
        { error: "That sample resume could not be used." },
        { status: 422 },
      );
    }

    return NextResponse.json(draft, {
      headers: {
        [DEMO_LIVE_EXTRACTION_HEADER]: DEMO_LIVE_EXTRACTION_VALUE,
      },
    });
  } catch (error) {
    const debug = describeResumeExtractionFailure(error);

    console.error("Public demo resume extraction failed:", debug);

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
