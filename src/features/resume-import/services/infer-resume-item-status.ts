import type { RawResumeItem } from
  "../schemas/resume-extraction";

const CURRENT_PATTERN = /\b(present|current|now)\b/i;
const COMPLETED_COURSE_PATTERN =
  /\b(earned|issued|completed|awarded|certified)\b/i;

export function inferResumeItemStatus(
  item: Pick<
    RawResumeItem,
    | "kind"
    | "startDate"
    | "endDate"
    | "isCurrent"
    | "sourceExcerpt"
  >,
): "completed" | "in-progress" {
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
