import { afterEach, describe, expect, it, vi } from "vitest";

import { extractResumeSource } from "./resume-import-client";
import type { ResumeImportDraft } from "../types/resume-import";

describe("extractResumeSource", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns a ResumeImportDraft when the extract route succeeds", async () => {
    const draft: ResumeImportDraft = {
      sources: [{ id: "source-1", displayName: "Pasted resume" }],
      program: "B.S. Computer Science",
      institution: "State University",
      proposedName: "Jordan Lee",
      applyProposedName: false,
      items: [
        {
          id: "item-1",
          kind: "project",
          title: "Catalyst",
          status: "in-progress",
          skills: [],
          selectedSkillIds: [],
          sourceIds: ["source-1"],
        },
      ],
      standaloneSkills: [],
      selectedStandaloneSkillIds: [],
      possibleDuplicates: [],
    };

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(draft), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await extractResumeSource({
      sourceId: "source-1",
      displayName: "Pasted resume",
      text: "Software Engineering Intern at Acme. Built a Next.js dashboard using TypeScript.",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/ai/extract-resume",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }),
    );
    expect(result).toEqual(draft);
    expect(result.items[0]?.title).toBe("Catalyst");
  });

  it("throws the server error message when analysis fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            error: "Mova could not analyze that resume. Please try again.",
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          },
        ),
      ),
    );

    await expect(
      extractResumeSource({
        sourceId: "source-1",
        displayName: "Pasted resume",
        text: "Software Engineering Intern at Acme. Built a Next.js dashboard using TypeScript.",
      }),
    ).rejects.toThrow("Mova could not analyze that resume. Please try again.");
  });
});
