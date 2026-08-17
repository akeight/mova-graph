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

export type ItemExcerptContext = {
  itemCount: number;
  hasSkillsSection: boolean;
};

function isWholeResumeExcerpt(
  excerpt: string,
  resumeText: string,
  maxChars: number,
): boolean {
  const excerptKey = createEvidenceLookupKey(excerpt);
  const resumeKey = createEvidenceLookupKey(resumeText);

  if (excerptKey && resumeKey && excerptKey === resumeKey) {
    return true;
  }

  return (
    resumeText.length > maxChars &&
    excerpt.length > resumeText.length * MAX_EXCERPT_RESUME_FRACTION
  );
}

export function isItemExcerptAcceptable(
  excerpt: string,
  resumeText: string,
  context: ItemExcerptContext,
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

  const guardWholeResume =
    context.itemCount > 1 || context.hasSkillsSection;

  if (
    guardWholeResume &&
    isWholeResumeExcerpt(trimmed, resumeText, SOURCE_EXCERPT_MAX_CHARS)
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
    isWholeResumeExcerpt(
      trimmed,
      resumeText,
      SKILLS_SECTION_EXCERPT_MAX_CHARS,
    )
  ) {
    return false;
  }

  return true;
}
