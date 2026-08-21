export const DEMO_LIVE_EXTRACTION_HEADER = "X-Mova-Demo-Extraction";
export const DEMO_LIVE_EXTRACTION_VALUE = "live";
export const DEMO_RESUME_EXTRACT_PATH = "/api/demo/extract-resume";
export const DEMO_RESUME_EXTRACT_TIMEOUT_MS = 28_000;

export type DemoResumeExtractionMode = "live" | "fallback";

let lastDemoResumeExtractionMode: DemoResumeExtractionMode | null = null;

export function rememberDemoResumeExtractionMode(
  mode: DemoResumeExtractionMode,
) {
  lastDemoResumeExtractionMode = mode;
}

export function getLastDemoResumeExtractionMode() {
  return lastDemoResumeExtractionMode;
}
