import type { ResumeItemKind } from
  "../schemas/resume-extraction";

const CURRENT_PATTERN = /\b(present|current|now)\b/i;
const COMPLETED_COURSE_PATTERN =
  /\b(earned|issued|completed|awarded|certified)\b/i;

export function inferResumeItemStatus(
  item: {
    kind: ResumeItemKind;
    startDate?: string | null;
    endDate?: string | null;
    isCurrent?: boolean | null;
    sourceExcerpt: string;
  },
): "completed" | "in-progress" {
  if (item.isCurrent === true) {
    return "in-progress";
  }

  const excerpt = item.sourceExcerpt;

  if (CURRENT_PATTERN.test(excerpt)) {
    return "in-progress";
  }

  if (item.endDate) {
    return "completed";
  }

  if (
    (item.kind === "course" || item.kind === "certification") &&
    COMPLETED_COURSE_PATTERN.test(excerpt)
  ) {
    return "completed";
  }

  return "in-progress";
}
