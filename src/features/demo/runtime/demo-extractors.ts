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

async function waitForDemoAnalysis(): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }

  await new Promise((resolve) => {
    window.setTimeout(resolve, 1600);
  });
}

export async function extractDemoResumeSource(): Promise<ResumeImportDraft> {
  await waitForDemoAnalysis();
  return structuredClone(DEMO_RESUME_DRAFT);
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
