import { createEvidenceLookupKey } from
  "@/features/goals/data/evidence-skills";
import { isPhraseGroundedInSource } from
  "@/features/goals/services/normalize-evidence";

import {
  MAX_EXCERPT_RESUME_FRACTION,
  SKILLS_SECTION_EXCERPT_MAX_CHARS,
  SKILLS_SECTION_EXCERPT_MIN_CHARS,
  SOURCE_EXCERPT_MAX_CHARS,
  SOURCE_EXCERPT_MIN_CHARS,
} from "../constants";

export function isItemExcerptAcceptable(
  excerpt: string,
  resumeText: string,
  itemCount: number,
): boolean {
  const trimmed = excerpt.trim();

  if (
    trimmed.length < SOURCE_EXCERPT_MIN_CHARS ||
    trimmed.length > SOURCE_EXCERPT_MAX_CHARS
  ) {
    return false;
  }

  if (!isPhraseGroundedInSource(trimmed, resumeText)) {
    return false;
  }

    if (itemCount > 1) {
      const excerptKey = createEvidenceLookupKey(trimmed);
      const resumeKey = createEvidenceLookupKey(resumeText);

      if (excerptKey && resumeKey && excerptKey === resumeKey) {
        return false;
      }

      if (
        resumeText.length > SOURCE_EXCERPT_MAX_CHARS &&
        trimmed.length > resumeText.length * MAX_EXCERPT_RESUME_FRACTION
      ) {
        return false;
      }
    }

  return true;
}

export function isSkillsSectionExcerptAcceptable(
  excerpt: string,
  resumeText: string,
  itemCount = 0,
): boolean {
  const trimmed = excerpt.trim();

  if (
    trimmed.length < SKILLS_SECTION_EXCERPT_MIN_CHARS ||
    trimmed.length > SKILLS_SECTION_EXCERPT_MAX_CHARS
  ) {
    return false;
  }

  if (!isPhraseGroundedInSource(trimmed, resumeText)) {
    return false;
  }

  if (itemCount > 0) {
    const excerptKey = createEvidenceLookupKey(trimmed);
    const resumeKey = createEvidenceLookupKey(resumeText);

    if (excerptKey && resumeKey && excerptKey === resumeKey) {
      return false;
    }

    if (
      resumeText.length > SKILLS_SECTION_EXCERPT_MAX_CHARS &&
      trimmed.length > resumeText.length * MAX_EXCERPT_RESUME_FRACTION
    ) {
      return false;
    }
  }

  return true;
}
