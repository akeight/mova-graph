import type { StudentProfile } from
  "@/features/student-profile/types/student-profile";

import type {
  DuplicateCandidate,
  ResumeDraftItem,
  ResumeImportDraft,
} from "../types/resume-import";
import { isCourseKind } from "../types/resume-import";

import {
  findResumeItemDuplicates,
  type ComparableResumeItem,
} from "./find-resume-item-duplicates";
import { mergeResumeDraftItems } from
  "./merge-resume-draft-items";
import {
  mergeExtractedSkills,
  mergeSelectedSkillIds,
} from "./resume-draft-skills";

function toComparable(item: ResumeDraftItem): ComparableResumeItem {
  return {
    id: item.id,
    kind: item.kind,
    title: item.title,
    organization: item.organization,
    startDate: item.startDate,
    endDate: item.endDate,
  };
}

function profileItemsToComparable(
  profile: StudentProfile,
): ComparableResumeItem[] {
  return [
    ...profile.courses.map((course) => ({
      id: course.id,
      kind: (course.kind ?? "course") as ResumeDraftItem["kind"],
      title: course.title,
    })),
    ...profile.experiences.map((experience) => ({
      id: experience.id,
      kind: (experience.kind ?? "work") as ResumeDraftItem["kind"],
      title: experience.title,
      organization: experience.organization,
      startDate: experience.startDate,
      endDate: experience.endDate,
    })),
  ];
}

function existingCollectionFor(
  profile: StudentProfile,
  itemId: string,
): "course" | "experience" | undefined {
  if (profile.courses.some((course) => course.id === itemId)) {
    return "course";
  }

  if (profile.experiences.some((experience) => experience.id === itemId)) {
    return "experience";
  }

  return undefined;
}

function mergeStandalone(
  left: ResumeImportDraft,
  right: ResumeImportDraft,
): Pick<
  ResumeImportDraft,
  "standaloneSkills" | "selectedStandaloneSkillIds"
> {
  const standaloneSkills = mergeExtractedSkills(
    left.standaloneSkills,
    right.standaloneSkills,
  );

  return {
    standaloneSkills,
    selectedStandaloneSkillIds: mergeSelectedSkillIds(
      standaloneSkills,
      left.selectedStandaloneSkillIds,
      right.selectedStandaloneSkillIds,
    ),
  };
}

function rewriteDuplicateCandidates(
  candidates: DuplicateCandidate[],
  resolvedId: string,
  removedId: string,
  survivingId: string,
): DuplicateCandidate[] {
  const seenPairs = new Set<string>();
  const rewritten: DuplicateCandidate[] = [];

  for (const candidate of candidates) {
    if (candidate.id === resolvedId) {
      continue;
    }

    const leftId =
      candidate.leftId === removedId ? survivingId : candidate.leftId;
    const rightId =
      candidate.rightId === removedId ? survivingId : candidate.rightId;

    if (leftId === rightId) {
      continue;
    }

    const pairKey = [leftId, rightId].sort().join(":");

    if (seenPairs.has(pairKey)) {
      continue;
    }

    seenPairs.add(pairKey);
    rewritten.push({
      ...candidate,
      leftId,
      rightId,
    });
  }

  return rewritten;
}

export function mergeResumeDrafts(
  drafts: ResumeImportDraft[],
  existingProfile?: StudentProfile,
): ResumeImportDraft {
  if (drafts.length === 0) {
    return {
      sources: [],
      applyProposedName: false,
      items: [],
      standaloneSkills: [],
      selectedStandaloneSkillIds: [],
      possibleDuplicates: [],
    };
  }

  let merged: ResumeImportDraft = {
    ...drafts[0],
    sources: [...drafts[0].sources],
    items: [...drafts[0].items],
    standaloneSkills: [...drafts[0].standaloneSkills],
    selectedStandaloneSkillIds: [
      ...drafts[0].selectedStandaloneSkillIds,
    ],
    possibleDuplicates: [],
  };

  for (const draft of drafts.slice(1)) {
    const matches = findResumeItemDuplicates(
      merged.items.map(toComparable),
      draft.items.map(toComparable),
    );
    const consumed = new Set<string>();
    const nextItems = [...merged.items];
    const possibleDuplicates: DuplicateCandidate[] = [
      ...merged.possibleDuplicates,
    ];

    for (const match of matches) {
      const left = nextItems.find((item) => item.id === match.leftId);
      const right = draft.items.find((item) => item.id === match.rightId);

      if (!left || !right) {
        continue;
      }

      consumed.add(right.id);

      if (match.confidence === "exact") {
        const index = nextItems.findIndex((item) => item.id === left.id);
        nextItems[index] = mergeResumeDraftItems(left, right);
        continue;
      }

      possibleDuplicates.push({
        id: crypto.randomUUID(),
        leftId: left.id,
        rightId: right.id,
        reason: match.reason,
      });
      nextItems.push(right);
    }

    for (const item of draft.items) {
      if (!consumed.has(item.id)) {
        nextItems.push(item);
      }
    }

    merged = {
      sources: [...merged.sources, ...draft.sources],
      program: merged.program || draft.program,
      institution: merged.institution || draft.institution,
      proposedName: merged.proposedName || draft.proposedName,
      applyProposedName: merged.applyProposedName,
      items: nextItems,
      ...mergeStandalone(merged, draft),
      possibleDuplicates,
    };
  }

  if (existingProfile) {
    const existingComparable = profileItemsToComparable(existingProfile);
    const matches = findResumeItemDuplicates(
      merged.items.map(toComparable),
      existingComparable,
    );

    merged = {
      ...merged,
      items: merged.items.map((item) => {
        const match = matches.find(
          (candidate) =>
            candidate.leftId === item.id &&
            candidate.confidence === "exact",
        );

        if (!match) {
          return item;
        }

        const existing = existingComparable.find(
          (candidate) => candidate.id === match.rightId,
        );

        if (!existing) {
          return item;
        }

        return {
          ...item,
          existingItemId: existing.id,
          existingCollection: isCourseKind(existing.kind)
            ? "course"
            : "experience",
        };
      }),
      possibleDuplicates: [
        ...merged.possibleDuplicates,
        ...matches
          .filter((match) => match.confidence === "probable")
          .map((match) => ({
            id: crypto.randomUUID(),
            leftId: match.leftId,
            rightId: match.rightId,
            reason: match.reason,
          })),
      ],
    };
  }

  return merged;
}

export function applyDuplicateDecision(
  draft: ResumeImportDraft,
  duplicateId: string,
  decision: "merge" | "keep-separate",
  existingProfile?: StudentProfile,
): ResumeImportDraft {
  const duplicate = draft.possibleDuplicates.find(
    (item) => item.id === duplicateId,
  );

  if (!duplicate) {
    return draft;
  }

  if (decision === "keep-separate") {
    return {
      ...draft,
      possibleDuplicates: draft.possibleDuplicates.filter(
        (item) => item.id !== duplicateId,
      ),
    };
  }

  const left = draft.items.find((item) => item.id === duplicate.leftId);
  const right = draft.items.find((item) => item.id === duplicate.rightId);

  if (left && right) {
    const mergedItem = mergeResumeDraftItems(left, right);

    return {
      ...draft,
      items: [
        ...draft.items.filter(
          (item) => item.id !== left.id && item.id !== right.id,
        ),
        mergedItem,
      ],
      possibleDuplicates: rewriteDuplicateCandidates(
        draft.possibleDuplicates,
        duplicate.id,
        right.id,
        mergedItem.id,
      ),
    };
  }

  if (left && !right && existingProfile) {
    const existingCollection = existingCollectionFor(
      existingProfile,
      duplicate.rightId,
    );

    if (!existingCollection) {
      return {
        ...draft,
        possibleDuplicates: draft.possibleDuplicates.filter(
          (item) => item.id !== duplicateId,
        ),
      };
    }

    return {
      ...draft,
      items: draft.items.map((item) =>
        item.id === left.id
          ? {
              ...item,
              existingItemId: duplicate.rightId,
              existingCollection,
            }
          : item,
      ),
      possibleDuplicates: rewriteDuplicateCandidates(
        draft.possibleDuplicates,
        duplicate.id,
        duplicate.rightId,
        left.id,
      ),
    };
  }

  return {
    ...draft,
    possibleDuplicates: draft.possibleDuplicates.filter(
      (item) => item.id !== duplicateId,
    ),
  };
}
