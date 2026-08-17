import type { ResumeItemKind } from
  "../schemas/resume-extraction";
import { isCourseKind } from "../types/resume-import";

export type ComparableResumeItem = {
  id: string;
  kind: ResumeItemKind;
  title: string;
  organization?: string;
  startDate?: string;
  endDate?: string;
};

export type DuplicateMatch = {
  leftId: string;
  rightId: string;
  confidence: "exact" | "probable";
  reason: string;
};

function normalizeOrg(value?: string): string {
  return (value ?? "")
    .toLowerCase()
    .replace(/\b(inc|llc|corp|ltd|co)\b\.?/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function normalizeTitle(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function tokens(value: string): Set<string> {
  return new Set(normalizeTitle(value).split(" ").filter(Boolean));
}

function jaccard(left: string, right: string): number {
  const leftTokens = tokens(left);
  const rightTokens = tokens(right);

  if (leftTokens.size === 0 || rightTokens.size === 0) {
    return 0;
  }

  let intersection = 0;

  for (const token of leftTokens) {
    if (rightTokens.has(token)) {
      intersection += 1;
    }
  }

  return intersection / new Set([...leftTokens, ...rightTokens]).size;
}

function parseDateBound(
  value: string | undefined,
  bound: "start" | "end",
): number | null {
  if (!value) {
    return null;
  }

  const [year, month] = value.split("-").map(Number);
  const monthIndex = month ? month - 1 : bound === "start" ? 0 : 11;

  return Date.UTC(year, monthIndex, bound === "start" ? 1 : 28);
}

function datesConflict(
  left: ComparableResumeItem,
  right: ComparableResumeItem,
): boolean {
  const leftStart = parseDateBound(left.startDate, "start");
  const rightStart = parseDateBound(right.startDate, "start");
  const leftEnd = left.endDate
    ? parseDateBound(left.endDate, "end")
    : leftStart === null
      ? null
      : Number.POSITIVE_INFINITY;
  const rightEnd = right.endDate
    ? parseDateBound(right.endDate, "end")
    : rightStart === null
      ? null
      : Number.POSITIVE_INFINITY;

  if (
    leftStart === null ||
    leftEnd === null ||
    rightStart === null ||
    rightEnd === null
  ) {
    return false;
  }

  return leftEnd < rightStart || rightEnd < leftStart;
}

function sameCollection(
  left: ComparableResumeItem,
  right: ComparableResumeItem,
): boolean {
  return isCourseKind(left.kind) === isCourseKind(right.kind);
}

export function findResumeItemDuplicates(
  leftItems: ComparableResumeItem[],
  rightItems: ComparableResumeItem[],
): DuplicateMatch[] {
  const matches: DuplicateMatch[] = [];
  const usedRight = new Set<string>();

  for (const left of leftItems) {
    for (const right of rightItems) {
      if (usedRight.has(right.id) || left.id === right.id) {
        continue;
      }

      if (!sameCollection(left, right)) {
        continue;
      }

      if (datesConflict(left, right)) {
        continue;
      }

      const leftOrg = normalizeOrg(left.organization);
      const rightOrg = normalizeOrg(right.organization);
      const leftTitle = normalizeTitle(left.title);
      const rightTitle = normalizeTitle(right.title);
      const titleScore = jaccard(left.title, right.title);
      const titleContained =
        leftTitle.length > 0 &&
        rightTitle.length > 0 &&
        (leftTitle.includes(rightTitle) || rightTitle.includes(leftTitle));
      const orgsMatch =
        leftOrg.length > 0 && rightOrg.length > 0 && leftOrg === rightOrg;
      const bothOrgsMissing = !leftOrg && !rightOrg;

      const exact =
        (orgsMatch || (bothOrgsMissing && isCourseKind(left.kind))) &&
        (leftTitle === rightTitle || titleContained || titleScore >= 0.9);

      const probable =
        !exact &&
        (orgsMatch || bothOrgsMissing) &&
        titleScore >= 0.55;

      if (exact) {
        usedRight.add(right.id);
        matches.push({
          leftId: left.id,
          rightId: right.id,
          confidence: "exact",
          reason: "Same organization and matching title",
        });
        break;
      }

      if (probable) {
        usedRight.add(right.id);
        matches.push({
          leftId: left.id,
          rightId: right.id,
          confidence: "probable",
          reason: "These may be the same experience",
        });
        break;
      }
    }
  }

  return matches;
}
