import { anthropic } from "@ai-sdk/anthropic";

const DEFAULT_EXTRACTION_MODEL =
  "claude-opus-4-5";

export function getProfileExtractionModel() {
  return anthropic(
    process.env.ANTHROPIC_MODEL ??
      DEFAULT_EXTRACTION_MODEL,
  );
}