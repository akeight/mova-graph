import { MAX_RESUME_TOTAL_TEXT_CHARS } from "../constants";

export function canAddResumeSourceText(
  currentTotalChars: number,
  incomingChars: number,
): { ok: true } | { ok: false; error: string } {
  if (currentTotalChars + incomingChars > MAX_RESUME_TOTAL_TEXT_CHARS) {
    return {
      ok: false,
      error:
        "These resumes together are too long. Keep the combined text under 60,000 characters, or remove a source before adding another.",
    };
  }

  return { ok: true };
}
