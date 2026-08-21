import { describe, expect, it } from "vitest";

import { DEMO_RESUME_DRAFT } from "../data/demo-resume";

import { parsePublicDemoResumeDraft } from
  "./parse-public-demo-resume-draft";

describe("parsePublicDemoResumeDraft", () => {
  it("accepts the saved demo fixture", () => {
    expect(parsePublicDemoResumeDraft(DEMO_RESUME_DRAFT)).toEqual(
      DEMO_RESUME_DRAFT,
    );
  });

  it("rejects null", () => {
    expect(parsePublicDemoResumeDraft(null)).toBeNull();
  });

  it("rejects an empty object", () => {
    expect(parsePublicDemoResumeDraft({})).toBeNull();
  });

  it("rejects a payload whose items are not an array", () => {
    expect(
      parsePublicDemoResumeDraft({
        ...DEMO_RESUME_DRAFT,
        items: "not-an-array",
      }),
    ).toBeNull();
  });

  it("rejects malformed item or skills entries", () => {
    expect(
      parsePublicDemoResumeDraft({
        ...DEMO_RESUME_DRAFT,
        items: [{ title: "Programming in Python" }],
      }),
    ).toBeNull();

    expect(
      parsePublicDemoResumeDraft({
        ...DEMO_RESUME_DRAFT,
        items: [
          {
            ...DEMO_RESUME_DRAFT.items[0],
            skills: [{ name: "Python" }],
          },
        ],
      }),
    ).toBeNull();
  });

  it("parses an apparently valid draft that later fails judge-readiness", () => {
    const parsed = parsePublicDemoResumeDraft({
      ...DEMO_RESUME_DRAFT,
      items: [
        {
          ...DEMO_RESUME_DRAFT.items[0],
          id: "generic-coursework",
          title: "Relevant Coursework",
        },
      ],
    });

    expect(parsed).not.toBeNull();
    expect(parsed?.items[0]?.title).toBe("Relevant Coursework");
  });
});
