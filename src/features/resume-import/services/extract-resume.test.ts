import { describe, expect, it } from "vitest";

import type {
  RawResumeExtraction,
  RawResumeItem,
} from "../schemas/resume-extraction";

import {
  COURSEWORK_EXTRACTION_RULES,
  extractResume,
  normalizeRawResumeExtraction,
  ResumeExtractionEmptyError,
} from "./extract-resume";

const resumeText = [
  "Jordan Lee",
  "B.S. Computer Science, State University, 2022-2026",
  "Coursework: Data Structures, Algorithms, Operating Systems, Databases",
  "Software Engineering Intern — Itron",
  "Built .NET MAUI features.",
  "Catalyst",
  "Built a React dashboard.",
  "Skills: AWS, Docker",
].join("\n");

function item(
  value: Pick<RawResumeItem, "kind" | "title" | "sourceExcerpt" | "skills"> &
    Partial<RawResumeItem>,
): RawResumeItem {
  return {
    organization: null,
    startDate: null,
    endDate: null,
    isCurrent: null,
    description: null,
    ...value,
  };
}

function extraction(
  value: Pick<RawResumeExtraction, "items" | "standaloneSkills"> &
    Partial<RawResumeExtraction>,
): RawResumeExtraction {
  return {
    candidateName: null,
    program: null,
    institution: null,
    skillsSectionExcerpt: null,
    ...value,
  };
}

describe("normalizeRawResumeExtraction", () => {
  it("rejects React evidence attached to the wrong activity", () => {
    const draft = normalizeRawResumeExtraction(
      "source-1",
      "swe.pdf",
      extraction({
        items: [
          item({
            kind: "work",
            title: "Software Engineering Intern",
            organization: "Itron",
            sourceExcerpt:
              "Software Engineering Intern — Itron\nBuilt .NET MAUI features.",
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
          }),
          item({
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
          }),
        ],
        standaloneSkills: [],
      }),
      resumeText,
    );

    const itron = draft.items.find(
      (entry) => entry.organization === "Itron",
    );
    const catalyst = draft.items.find((entry) => entry.title === "Catalyst");

    expect(itron?.skills.map((skill) => skill.id)).toContain("dotnet-maui");
    expect(itron?.skills.map((skill) => skill.id)).not.toContain("react");
    expect(catalyst?.skills.map((skill) => skill.id)).toContain("react");
  });

  it("rejects a whole-resume item excerpt when other items exist", () => {
    const longResume = `${resumeText}\n${"Additional context. ".repeat(150)}`;

    const draft = normalizeRawResumeExtraction(
      "source-1",
      "swe.pdf",
      extraction({
        items: [
          item({
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
          }),
          item({
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
          }),
        ],
        standaloneSkills: [],
      }),
      longResume,
    );

    const itron = draft.items.find((entry) => entry.title === "Itron");

    expect(itron).toBeUndefined();
  });

  it("grounds standalone skills only against the skills section", () => {
    const draft = normalizeRawResumeExtraction(
      "source-1",
      "swe.pdf",
      extraction({
        skillsSectionExcerpt: "Skills: AWS, Docker",
        items: [
          item({
            kind: "project",
            title: "Catalyst",
            sourceExcerpt: "Catalyst\nBuilt a React dashboard.",
            skills: [],
          }),
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
      }),
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
      extraction({
        items: [],
        standaloneSkills: [
          {
            sourcePhrase: "AWS",
            evidence: "Listed under Skills.",
            mappings: [{ canonicalSkillId: "aws", confidence: 0.9 }],
          },
        ],
      }),
      resumeText,
    );

    expect(draft.standaloneSkills).toEqual([]);
  });

  it("rejects a whole-resume skills excerpt when activities exist", () => {
    const longResume = `${resumeText}\n${"Additional context. ".repeat(150)}`;

    const draft = normalizeRawResumeExtraction(
      "source-1",
      "swe.pdf",
      extraction({
        skillsSectionExcerpt: longResume.slice(0, 1500),
        items: [
          item({
            kind: "project",
            title: "Catalyst",
            sourceExcerpt: "Catalyst\nBuilt a React dashboard.",
            skills: [],
          }),
        ],
        standaloneSkills: [
          {
            sourcePhrase: "React",
            evidence: "Built a React dashboard.",
            mappings: [{ canonicalSkillId: "react", confidence: 0.9 }],
          },
        ],
      }),
      longResume,
    );

    expect(draft.standaloneSkills.map((skill) => skill.id)).not.toContain(
      "react",
    );
  });

  it("preselects high-confidence direct evidence and leaves 0.70 unselected", () => {
    const catalystResume = [
      "Jordan Lee",
      "B.S. Computer Science, State University",
      "Coursework: Data Structures, Algorithms, Operating Systems",
      "Catalyst",
      "Built a React dashboard using TypeScript.",
      "Volunteer tutor for introductory programming.",
    ].join("\n");
    const catalystExcerpt = [
      "Catalyst",
      "Built a React dashboard using TypeScript.",
    ].join("\n");

    const draft = normalizeRawResumeExtraction(
      "source-1",
      "swe.pdf",
      extraction({
        items: [
          item({
            kind: "project",
            title: "Catalyst",
            sourceExcerpt: catalystExcerpt,
            skills: [
              {
                sourcePhrase: "React",
                evidence: "Built a React dashboard.",
                mappings: [{ canonicalSkillId: "react", confidence: 0.92 }],
              },
              {
                sourcePhrase: "TypeScript",
                evidence: "Used TypeScript.",
                mappings: [
                  { canonicalSkillId: "typescript", confidence: 0.7 },
                ],
              },
            ],
          }),
        ],
        standaloneSkills: [],
      }),
      catalystResume,
    );

    const catalyst = draft.items.find((entry) => entry.title === "Catalyst");

    expect(catalyst?.selectedSkillIds).toContain("react");
    expect(catalyst?.selectedSkillIds).not.toContain("typescript");
    expect(
      catalyst?.skills.some(
        (skill) => skill.id === "frontend-development" && skill.provenance === "derived",
      ),
    ).toBe(true);
    expect(catalyst?.selectedSkillIds).not.toContain("frontend-development");
  });

  it("does not turn standalone Skills evidence into activity-backed work on a one-item resume", () => {
    const oneItemResume = [
      "Software Engineering Intern — Acme",
      "Built a Next.js dashboard.",
      "Skills: AWS",
    ].join("\n");

    const draft = normalizeRawResumeExtraction(
      "source-1",
      "swe.pdf",
      extraction({
        skillsSectionExcerpt: "Skills: AWS",
        items: [
          item({
            kind: "work",
            title: "Software Engineering Intern",
            organization: "Acme",
            sourceExcerpt: oneItemResume,
            skills: [
              {
                sourcePhrase: "AWS",
                evidence: "Skills: AWS",
                mappings: [{ canonicalSkillId: "aws", confidence: 0.99 }],
              },
            ],
          }),
        ],
        standaloneSkills: [
          {
            sourcePhrase: "AWS",
            evidence: "Listed under Skills.",
            mappings: [{ canonicalSkillId: "aws", confidence: 0.9 }],
          },
        ],
      }),
      oneItemResume,
    );

    expect(draft.items).toHaveLength(0);
    expect(draft.standaloneSkills.map((skill) => skill.id)).toContain("aws");
  });

  it("rejects a whole-resume work excerpt even when the model omits the skills section", () => {
    const mixedResume = [
      "Software Engineering Intern — Acme",
      "Built internal tooling for the platform team.",
      "B.S. Computer Science, State University",
      "Coursework includes algorithms, operating systems, and databases.",
      "Skills: AWS",
    ].join("\n");

    const draft = normalizeRawResumeExtraction(
      "source-1",
      "swe.pdf",
      extraction({
        items: [
          item({
            kind: "work",
            title: "Software Engineering Intern",
            organization: "Acme",
            sourceExcerpt: mixedResume,
            skills: [
              {
                sourcePhrase: "AWS",
                evidence: "Skills: AWS",
                mappings: [{ canonicalSkillId: "aws", confidence: 0.99 }],
              },
            ],
          }),
        ],
        standaloneSkills: [
          {
            sourcePhrase: "AWS",
            evidence: "Listed under Skills.",
            mappings: [{ canonicalSkillId: "aws", confidence: 0.9 }],
          },
        ],
      }),
      mixedResume,
    );

    expect(draft.items).toHaveLength(0);
    expect(draft.standaloneSkills).toEqual([]);
    expect(
      draft.items.some((entry) =>
        entry.skills.some((skill) => skill.id === "aws"),
      ),
    ).toBe(false);
  });
});

describe("extractResume", () => {
  const input = {
    sourceId: "source-1",
    displayName: "Pasted resume",
    text: resumeText,
  };

  it("returns a usable draft from valid raw AI extraction", async () => {
    const draft = await extractResume(input, async () =>
      extraction({
        candidateName: "Jordan Lee",
        program: "B.S. Computer Science",
        institution: "State University",
        skillsSectionExcerpt: "Skills: AWS, Docker",
        items: [
          item({
            kind: "work",
            title: "Software Engineering Intern",
            organization: "Itron",
            startDate: "2025-05",
            endDate: "2025-08",
            sourceExcerpt:
              "Software Engineering Intern — Itron\nBuilt .NET MAUI features.",
            skills: [
              {
                sourcePhrase: ".NET MAUI",
                evidence: "Built .NET MAUI features.",
                mappings: [
                  { canonicalSkillId: "dotnet-maui", confidence: 0.99 },
                ],
              },
            ],
          }),
          item({
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
          }),
        ],
        standaloneSkills: [
          {
            sourcePhrase: "AWS",
            evidence: "Listed under Skills.",
            mappings: [{ canonicalSkillId: "aws", confidence: 0.9 }],
          },
        ],
      }),
    );

    expect(draft.proposedName).toBe("Jordan Lee");
    expect(draft.program).toBe("B.S. Computer Science");
    expect(draft.institution).toBe("State University");
    expect(draft.items.map((entry) => entry.title)).toEqual([
      "Software Engineering Intern",
      "Catalyst",
    ]);
    expect(draft.standaloneSkills.map((skill) => skill.id)).toContain("aws");
  });

  it("throws when every extracted item is rejected by grounding", async () => {
    await expect(
      extractResume(input, async () =>
        extraction({
          items: [
            item({
              kind: "work",
              title: "Invented Role",
              sourceExcerpt: "This excerpt is not present in the resume text.",
              skills: [],
            }),
          ],
          standaloneSkills: [],
        }),
      ),
    ).rejects.toBeInstanceOf(ResumeExtractionEmptyError);
  });

  it("keeps named coursework as separate grounded course items", async () => {
    const courseworkExcerpt = [
      "Relevant Coursework:",
      "Programming in Python, Data Structures and Algorithms,",
      "Frontend Web Development, Probability & Statistics",
    ].join("\n");
    const courseworkResume = [
      "Jordan Lee",
      "B.S. Software Engineering, State University, 2022-2026",
      courseworkExcerpt,
      "Software Engineering Intern — Itron",
      "Built .NET MAUI features for internal tooling used by the platform team.",
      "Catalyst",
      "Built a React dashboard for student progress tracking.",
      "Volunteer tutor for introductory programming workshops.",
      "Skills: AWS, Docker, TypeScript",
    ].join("\n");
    const courseTitles = [
      "Programming in Python",
      "Data Structures and Algorithms",
      "Frontend Web Development",
      "Probability & Statistics",
    ] as const;

    const pythonClaim = {
      sourcePhrase: "Python",
      evidence: "Programming in Python",
      mappings: [],
    };
    const leakedPythonClaim = {
      sourcePhrase: "Programming in Python",
      evidence: "Programming in Python",
      mappings: [],
    };

    const draft = await extractResume(
      {
        sourceId: "source-1",
        displayName: "coursework.pdf",
        text: courseworkResume,
      },
      async () =>
        extraction({
          items: courseTitles.map((title) =>
            item({
              kind: "course",
              title,
              sourceExcerpt: courseworkExcerpt,
              skills:
                title === "Programming in Python"
                  ? [pythonClaim]
                  : title === "Data Structures and Algorithms"
                    ? [leakedPythonClaim]
                    : [],
            }),
          ),
          standaloneSkills: [],
        }),
    );

    const courses = draft.items.filter((entry) => entry.kind === "course");
    const programmingInPython = courses.find(
      (entry) => entry.title === "Programming in Python",
    );
    const dataStructures = courses.find(
      (entry) => entry.title === "Data Structures and Algorithms",
    );
    const python = programmingInPython?.skills.find(
      (skill) => skill.id === "python",
    );

    expect(courses.map((entry) => entry.title)).toEqual([...courseTitles]);
    expect(
      courses.some((entry) => entry.title === "Relevant Coursework"),
    ).toBe(false);
    expect(courses).toHaveLength(4);
    expect(python).toMatchObject({
      id: "python",
      provenance: "direct",
      confidence: 0,
    });
    expect(["exact-id", "exact-name", "alias"]).toContain(
      python?.normalizationMethod,
    );
    expect(dataStructures?.skills).toEqual([]);
    expect(dataStructures?.selectedSkillIds).toEqual([]);

    for (const course of courses) {
      expect(course.status).toBe("in-progress");
    }
  });
});

describe("COURSEWORK_EXTRACTION_RULES", () => {
  it("instructs the model to split named coursework without inventing or auto-copying skills", () => {
    expect(COURSEWORK_EXTRACTION_RULES).toContain(
      "one kind \"course\" item per explicitly named course",
    );
    expect(COURSEWORK_EXTRACTION_RULES).toContain(
      "Relevant Coursework",
    );
    expect(COURSEWORK_EXTRACTION_RULES).toContain(
      "Do not invent individual courses from a degree or program name",
    );
    expect(COURSEWORK_EXTRACTION_RULES).toContain(
      "Course titles are not automatically copied into skills",
    );
    expect(COURSEWORK_EXTRACTION_RULES).toContain(
      "direct and literal",
    );
    expect(COURSEWORK_EXTRACTION_RULES).toContain(
      "MUST share the same verbatim sourceExcerpt",
    );
    expect(COURSEWORK_EXTRACTION_RULES).not.toContain(
      "A name in a coursework list is not enough",
    );
  });
});
