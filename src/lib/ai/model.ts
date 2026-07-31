import { openai } from "@ai-sdk/openai";

const DEFAULT_EXTRACTION_MODEL =
  "gpt-5-mini";

export function getProfileExtractionModel() {
  return openai(
    process.env.OPENAI_MODEL ??
      DEFAULT_EXTRACTION_MODEL,
  );
}