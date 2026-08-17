import { describe, expect, it } from "vitest";

import { normalizeRawResumeExtraction } from "./extract-resume";

const resumeText = [
  "Software Engineering Intern — Itron",
  "Built .NET MAUI features.",
  "Catalyst",
  "Built a React dashboard.",
  "Skills: AWS, Docker",
].join("\n");

describe("normalizeRawResumeExtraction", () => {
  it("rejects React evidence attached to the wrong activity", () => {
    const draft = normalizeRawResumeExtraction(
      "source-1",
      "swe.pdf",
      {
        items: [
          {
            kind: "work",
            title: "Software Engineering Intern",
            organization: "Itron",
            sourceExcerpt: "Software Engineering Intern — Itron\nBuilt .NET MAUI features.",
            skills: [
              {
                sourcePhrase: "React",
                evidence: "Built a React dashboard.",
                mappings: [
                  { canonicalSkillId: "react", confidence: 0.99 },
                ],
              },
              {
                sourcePhrase: ".NET MAUI",
                evidence: "Built .NET MAUI features.",
                mappings: [
                  { canonicalSkillId: "dotnet-maui", confidence: 0.99 },
                ],
              },
            ],
          },
          {
            kind: "project",
            title: "Catalyst",
            sourceExcerpt: "Catalyst\nBuilt a React dashboard.",
            skills: [
              {
                sourcePhrase: "React",
                evidence: "Built a React dashboard.",
                mappings: [
                  { canonicalSkillId: "react", confidence: 0.99 },
                ],
              },
            ],
          },
        ],
        standaloneSkills: [],
      },
      resumeText,
    );

    const itron = draft.items.find(
      (item) => item.organization === "Itron",
    );
    const catalyst = draft.items.find((item) => item.title === "Catalyst");

    expect(itron?.skills.map((skill) => skill.id)).toContain("dotnet-maui");
    expect(itron?.skills.map((skill) => skill.id)).not.toContain("react");
    expect(catalyst?.skills.map((skill) => skill.id)).toContain("react");
  });

  it("rejects a whole-resume item excerpt when other items exist", () => {
    const longResume = `${resumeText}\n${"Additional context. ".repeat(150)}`;

    const draft = normalizeRawResumeExtraction(
      "source-1",
      "swe.pdf",
      {
        items: [
          {
            kind: "work",
            title: "Itron",
            sourceExcerpt: longResume.slice(0, 2000),
            skills: [
              {
                sourcePhrase: "React",
                evidence: "Built a React dashboard.",
                mappings: [
                  { canonicalSkillId: "react", confidence: 0.99 },
                ],
              },
            ],
          },
          {
            kind: "project",
            title: "Catalyst",
            sourceExcerpt: "Catalyst\nBuilt a React dashboard.",
            skills: [
              {
                sourcePhrase: "React",
                evidence: "Built a React dashboard.",
                mappings: [
                  { canonicalSkillId: "react", confidence: 0.99 },
                ],
              },
            ],
          },
        ],
        standaloneSkills: [],
      },
      longResume,
    );

    const itron = draft.items.find((item) => item.title === "Itron");

    expect(itron?.skills).toEqual([]);
  });

  it("grounds standalone skills only against the skills section", () => {
    const draft = normalizeRawResumeExtraction(
      "source-1",
      "swe.pdf",
      {
        skillsSectionExcerpt: "Skills: AWS, Docker",
        items: [
          {
            kind: "project",
            title: "Catalyst",
            sourceExcerpt: "Catalyst\nBuilt a React dashboard.",
            skills: [],
          },
        ],
        standaloneSkills: [
          {
            sourcePhrase: "AWS",
            evidence: "Listed under Skills.",
            mappings: [{ canonicalSkillId: "aws", confidence: 0.9 }],
          },
          {
            sourcePhrase: "React",
            evidence: "Built a React dashboard.",
            mappings: [{ canonicalSkillId: "react", confidence: 0.9 }],
          },
        ],
      },
      resumeText,
    );

    expect(draft.standaloneSkills.map((skill) => skill.id)).toContain("aws");
    expect(draft.standaloneSkills.map((skill) => skill.id)).not.toContain(
      "react",
    );
  });

  it("drops standalone skills without a grounded skills section", () => {
    const draft = normalizeRawResumeExtraction(
      "source-1",
      "swe.pdf",
      {
        items: [],
        standaloneSkills: [
          {
            sourcePhrase: "AWS",
            evidence: "Listed under Skills.",
            mappings: [{ canonicalSkillId: "aws", confidence: 0.9 }],
          },
        ],
      },
      resumeText,
    );

    expect(draft.standaloneSkills).toEqual([]);
  });

  it("rejects a whole-resume skills excerpt when activities exist", () => {
    const longResume = `${resumeText}\n${"Additional context. ".repeat(150)}`;

    const draft = normalizeRawResumeExtraction(
      "source-1",
      "swe.pdf",
      {
        skillsSectionExcerpt: longResume.slice(0, 1500),
        items: [
          {
            kind: "project",
            title: "Catalyst",
            sourceExcerpt: "Catalyst\nBuilt a React dashboard.",
            skills: [],
          },
        ],
        standaloneSkills: [
          {
            sourcePhrase: "React",
            evidence: "Built a React dashboard.",
            mappings: [{ canonicalSkillId: "react", confidence: 0.9 }],
          },
        ],
      },
      longResume,
    );

    expect(draft.standaloneSkills.map((skill) => skill.id)).not.toContain(
      "react",
    );
  });
});
