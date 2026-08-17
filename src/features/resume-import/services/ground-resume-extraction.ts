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

function isExactWholeResumeExcerpt(
  excerpt: string,
  resumeText: string,
): boolean {
  const excerptKey = createEvidenceLookupKey(excerpt);
  const resumeKey = createEvidenceLookupKey(resumeText);

  return Boolean(excerptKey && resumeKey && excerptKey === resumeKey);
}

function isOversizedExcerpt(excerpt: string, resumeText: string): boolean {
  return excerpt.length > resumeText.length * MAX_EXCERPT_RESUME_FRACTION;
}

export function isItemExcerptAcceptable(
  excerpt: string,
  resumeText: string,
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

  if (
    isExactWholeResumeExcerpt(trimmed, resumeText) ||
    isOversizedExcerpt(trimmed, resumeText)
  ) {
    return false;
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

  if (
    itemCount > 0 &&
    (isExactWholeResumeExcerpt(trimmed, resumeText) ||
      isOversizedExcerpt(trimmed, resumeText))
  ) {
    return false;
  }

  return true;
}
