import { describe, expect, it } from "vitest";

import type { ResumeDraftItem, ResumeImportDraft } from
  "../types/resume-import";

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
            title: "Mobile Software Engineering Intern",
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
});
