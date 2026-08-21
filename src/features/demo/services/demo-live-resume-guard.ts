import type { ResumeDraftItem, ResumeImportDraft } from
  "@/features/resume-import/types/resume-import";

const GENERIC_COURSE_TITLES = new Set([
  "relevant coursework",
  "coursework",
  "selected coursework",
  "courses",
]);

function normalizedTitle(title: string) {
  return title.trim().toLowerCase();
}

function itemByNormalizedTitle(
  items: ResumeDraftItem[],
  title: string,
) {
  const expected = normalizedTitle(title);

  return items.find((item) => normalizedTitle(item.title) === expected);
}

function directSkillIds(item: ResumeDraftItem) {
  return item.skills
    .filter((skill) => skill.provenance !== "derived")
    .map((skill) => skill.id);
}

export function isAcceptablePublicDemoResumeDraft(
  draft: ResumeImportDraft,
): boolean {
  if (draft.items.length === 0) {
    return false;
  }

  if (
    draft.items.some((item) =>
      GENERIC_COURSE_TITLES.has(normalizedTitle(item.title)),
    )
  ) {
    return false;
  }

  const dataStructures = itemByNormalizedTitle(
    draft.items,
    "Data Structures and Algorithms",
  );

  if (dataStructures?.kind === "course") {
    if (directSkillIds(dataStructures).includes("python")) {
      return false;
    }
  }

  const frontend = itemByNormalizedTitle(
    draft.items,
    "Frontend Web Development",
  );

  if (frontend?.kind === "course") {
    if (directSkillIds(frontend).includes("react")) {
      return false;
    }
  }

  return true;
}
