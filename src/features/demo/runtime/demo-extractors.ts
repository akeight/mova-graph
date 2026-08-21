import type { OpportunityExtraction } from
  "@/features/opportunity-what-if/types/opportunity-what-if";
import type { OpportunityExtractionInput } from
  "@/features/opportunity-what-if/schemas/opportunity-extraction";
import type { ResumeImportDraft } from
  "@/features/resume-import/types/resume-import";

import {
  DEMO_RESUME_DRAFT,
} from "../data/demo-resume";
import {
  DEMO_OPPORTUNITY_EXTRACTION,
} from "../data/demo-opportunity";
import { isAcceptablePublicDemoResumeDraft } from
  "../services/demo-live-resume-guard";
import { parsePublicDemoResumeDraft } from
  "../services/parse-public-demo-resume-draft";

import {
  DEMO_LIVE_EXTRACTION_HEADER,
  DEMO_LIVE_EXTRACTION_VALUE,
  DEMO_RESUME_EXTRACT_PATH,
  DEMO_RESUME_EXTRACT_TIMEOUT_MS,
  rememberDemoResumeExtractionMode,
} from "./demo-live-extraction";

async function waitForDemoAnalysis(): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }

  await new Promise((resolve) => {
    window.setTimeout(resolve, 1600);
  });
}

function fallbackResumeDraft(): ResumeImportDraft {
  rememberDemoResumeExtractionMode("fallback");
  return structuredClone(DEMO_RESUME_DRAFT);
}

export async function extractDemoResumeSource(
  _input?: {
    sourceId: string;
    displayName: string;
    text: string;
  },
): Promise<ResumeImportDraft> {
  void _input;

  try {
    const response = await fetch(DEMO_RESUME_EXTRACT_PATH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
      signal: AbortSignal.timeout(DEMO_RESUME_EXTRACT_TIMEOUT_MS),
    });

    if (
      !response.ok ||
      response.headers.get(DEMO_LIVE_EXTRACTION_HEADER) !==
        DEMO_LIVE_EXTRACTION_VALUE
    ) {
      return fallbackResumeDraft();
    }

    const body: unknown = await response.json();
    const draft = parsePublicDemoResumeDraft(body);

    if (!draft || !isAcceptablePublicDemoResumeDraft(draft)) {
      return fallbackResumeDraft();
    }

    rememberDemoResumeExtractionMode("live");
    return draft;
  } catch {
    return fallbackResumeDraft();
  }
}

export async function parseDemoResumeFile(): Promise<{
  displayName: string;
  text: string;
}> {
  throw new Error(
    "File upload isn't available in the public demo. Use the sample resume, or sign in to import your own.",
  );
}

export async function extractDemoOpportunitySource(
  _input: OpportunityExtractionInput,
): Promise<OpportunityExtraction> {
  void _input;
  await waitForDemoAnalysis();
  return structuredClone(DEMO_OPPORTUNITY_EXTRACTION);
}
