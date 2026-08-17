import { describe, expect, it } from "vitest";

import type { ResumeDraftItem, ResumeImportDraft } from
  "../types/resume-import";

import { applyResumeDraftToProfile } from
  "./apply-resume-draft-to-profile";
import { mergeResumeDraftItems } from
  "./merge-resume-draft-items";
import { applyDuplicateDecision, mergeResumeDrafts } from
  "./merge-resume-drafts";

function skill(id: string, name = id) {
  return {
    id,
    name,
    confidence: 0.9,
    evidence: name,
    provenance: "direct" as const,
  };
}

function item(
  overrides: Partial<ResumeDraftItem> & Pick<ResumeDraftItem, "id" | "title">,
): ResumeDraftItem {
  return {
    kind: "work",
    status: "completed",
    skills: [],
    selectedSkillIds: [],
    sourceIds: ["a"],
    ...overrides,
  };
}

function draft(
  items: ResumeDraftItem[],
  sourceId: string,
): ResumeImportDraft {
  return {
    sources: [{ id: sourceId, displayName: `${sourceId}.pdf` }],
    applyProposedName: false,
    items,
    standaloneSkills: [],
    selectedStandaloneSkillIds: [],
    possibleDuplicates: [],
  };
}

describe("mergeResumeDrafts", () => {
  it("auto-merges the same Acme internship and unions evidence", () => {
    const merged = mergeResumeDrafts([
      draft(
        [
          item({
            id: "left",
            title: "Software Engineering Intern",
            organization: "Acme",
            startDate: "2025-05",
            endDate: "2025-08",
            skills: [skill("dotnet-maui", ".NET MAUI"), skill("software-testing", "Software Testing")],
            sourceIds: ["a"],
          }),
        ],
        "a",
      ),
      draft(
        [
          item({
            id: "right",
            title: "Software Engineering Intern",
            organization: "Acme",
            startDate: "2025-05",
            endDate: "2025-08",
            skills: [
              skill("dotnet-maui", ".NET MAUI"),
              skill("ios-development", "iOS Development"),
              skill("android-development", "Android Development"),
              skill("api-integration", "API Integration"),
            ],
            sourceIds: ["b"],
          }),
        ],
        "b",
      ),
    ]);

    expect(merged.items).toHaveLength(1);
    expect(merged.items[0]?.title).toContain("Software Engineering Intern");
    expect(merged.items[0]?.skills.map((entry) => entry.id).sort()).toEqual([
      "android-development",
      "api-integration",
      "dotnet-maui",
      "ios-development",
      "software-testing",
    ]);
    expect(merged.items[0]?.skills.map((entry) => entry.id)).not.toContain("swift");
  });

  it("keeps distinct companies separate", () => {
    const merged = mergeResumeDrafts([
      draft(
        [item({ id: "acme", title: "Software Engineering Intern", organization: "Acme" })],
        "a",
      ),
      draft(
        [item({ id: "contoso", title: "Product Management Intern", organization: "Contoso" })],
        "b",
      ),
    ]);

    expect(merged.items).toHaveLength(2);
    expect(merged.possibleDuplicates).toEqual([]);
  });

  it("dedupes Postgres aliases in standalone skills", () => {
    const left: ResumeImportDraft = {
      ...draft([], "a"),
      standaloneSkills: [skill("postgresql", "PostgreSQL")],
    };
    const right: ResumeImportDraft = {
      ...draft([], "b"),
      standaloneSkills: [skill("postgresql", "PostgreSQL")],
    };

    const merged = mergeResumeDrafts([left, right]);

    expect(merged.standaloneSkills).toHaveLength(1);
    expect(merged.standaloneSkills[0]?.id).toBe("postgresql");
  });

  it("does not auto-merge title containment as an exact duplicate", () => {
    const merged = mergeResumeDrafts([
      draft(
        [item({
          id: "left",
          title: "Software Engineer",
          organization: "Acme",
        })],
        "a",
      ),
      draft(
        [item({
          id: "right",
          title: "Senior Software Engineer",
          organization: "Acme",
        })],
        "b",
      ),
    ]);

    expect(merged.items).toHaveLength(2);
    expect(merged.possibleDuplicates).toHaveLength(1);
    expect(merged.possibleDuplicates[0]).toMatchObject({
      leftId: "left",
      rightId: "right",
    });
  });

  it("keeps probable duplicates reviewable until the user decides", () => {
    const merged = mergeResumeDrafts([
      draft(
        [item({
          id: "left",
          title: "Senior Software Engineering Intern",
          organization: "Acme",
        })],
        "a",
      ),
      draft(
        [item({
          id: "right",
          title: "Software Engineering Intern Lead",
          organization: "Acme",
        })],
        "b",
      ),
    ]);

    expect(merged.possibleDuplicates.length + merged.items.length).toBeGreaterThan(1);

    if (merged.possibleDuplicates[0]) {
      const decided = applyDuplicateDecision(
        merged,
        merged.possibleDuplicates[0].id,
        "merge",
      );
      expect(decided.items).toHaveLength(1);
      expect(decided.possibleDuplicates).toEqual([]);
    }
  });

  it("keeps existing-profile probable matches unlinked until merge", () => {
    const existingProfile = {
      id: "student-1",
      name: "jordan",
      courses: [],
      experiences: [
        {
          id: "existing-catalyst",
          title: "Catalyst",
          status: "completed" as const,
          skillIds: ["react"],
          kind: "project" as const,
        },
      ],
      skills: [
        {
          id: "react",
          name: "React",
          status: "demonstrated" as const,
        },
      ],
    };

    const merged = mergeResumeDrafts(
      [
        draft(
          [
            item({
              id: "imported-catalyst",
              kind: "project",
              title: "Catalyst",
              skills: [skill("typescript", "TypeScript")],
              selectedSkillIds: ["typescript"],
            }),
          ],
          "a",
        ),
      ],
      existingProfile,
    );

    expect(merged.items[0]?.existingItemId).toBeUndefined();
    expect(merged.possibleDuplicates).toHaveLength(1);

    const keepSeparate = applyDuplicateDecision(
      merged,
      merged.possibleDuplicates[0]!.id,
      "keep-separate",
      existingProfile,
    );
    const mergedDecision = applyDuplicateDecision(
      merged,
      merged.possibleDuplicates[0]!.id,
      "merge",
      existingProfile,
    );

    expect(keepSeparate.items[0]?.existingItemId).toBeUndefined();
    expect(mergedDecision.items[0]?.existingItemId).toBe("existing-catalyst");
    expect(keepSeparate.items[0]?.existingItemId).not.toBe(
      mergedDecision.items[0]?.existingItemId,
    );

    const keptProfile = applyResumeDraftToProfile(
      existingProfile,
      keepSeparate,
      "later",
    );
    const mergedProfile = applyResumeDraftToProfile(
      existingProfile,
      mergedDecision,
      "later",
    );

    expect(keptProfile.experiences).toHaveLength(2);
    expect(mergedProfile.experiences).toHaveLength(1);
    expect(mergedProfile.experiences[0]?.id).toBe("existing-catalyst");
    expect(mergedProfile.experiences[0]?.skillIds).toEqual(
      expect.arrayContaining(["react", "typescript"]),
    );
    expect(keptProfile.experiences.map((entry) => entry.id).sort()).not.toEqual(
      mergedProfile.experiences.map((entry) => entry.id).sort(),
    );
  });

  it("rewrites remaining duplicate candidates after a 3-source merge chain", () => {
    const starting: ResumeImportDraft = {
      ...draft(
        [
          item({ id: "a", title: "A", organization: "Acme" }),
          item({ id: "b", title: "B", organization: "Acme" }),
          item({ id: "c", title: "C", organization: "Acme" }),
        ],
        "a",
      ),
      possibleDuplicates: [
        {
          id: "dup-ab",
          leftId: "a",
          rightId: "b",
          reason: "A and B may be the same",
        },
        {
          id: "dup-bc",
          leftId: "b",
          rightId: "c",
          reason: "B and C may be the same",
        },
      ],
    };

    const afterAB = applyDuplicateDecision(starting, "dup-ab", "merge");

    expect(afterAB.items.map((entry) => entry.id).sort()).toEqual(["a", "c"]);
    expect(afterAB.possibleDuplicates).toEqual([
      expect.objectContaining({
        leftId: "a",
        rightId: "c",
      }),
    ]);
  });

  it("keeps the higher-confidence direct skill when merging", () => {
    const merged = mergeResumeDraftItems(
      item({
        id: "left",
        title: "Software Engineering Intern",
        organization: "Acme",
        skills: [
          {
            id: "react",
            name: "React",
            confidence: 0.7,
            evidence: "React",
            provenance: "direct",
          },
        ],
        selectedSkillIds: [],
      }),
      item({
        id: "right",
        title: "Software Engineering Intern",
        organization: "Acme",
        skills: [
          {
            id: "react",
            name: "React",
            confidence: 0.92,
            evidence: "React",
            provenance: "direct",
          },
        ],
        selectedSkillIds: ["react"],
      }),
    );

    expect(merged.skills[0]).toMatchObject({
      id: "react",
      confidence: 0.92,
      provenance: "direct",
    });
    expect(merged.selectedSkillIds).toEqual(["react"]);
  });
});
