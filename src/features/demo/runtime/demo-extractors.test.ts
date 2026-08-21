import { describe, expect, it, vi } from "vitest";

import { DEMO_OPPORTUNITY_EXTRACTION } from
  "../data/demo-opportunity";
import { DEMO_RESUME_DRAFT } from "../data/demo-resume";

import {
  extractDemoOpportunitySource,
  extractDemoResumeSource,
  parseDemoResumeFile,
} from "./demo-extractors";

describe("demo extractors", () => {
  it("loads the resume fixture without calling authenticated AI routes", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const draft = await extractDemoResumeSource();

    expect(draft.proposedName).toBe(DEMO_RESUME_DRAFT.proposedName);
    expect(draft.items).toHaveLength(DEMO_RESUME_DRAFT.items.length);
    expect(fetchMock).not.toHaveBeenCalled();

    vi.unstubAllGlobals();
  });

  it("loads the opportunity fixture without calling authenticated AI routes", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const extraction = await extractDemoOpportunitySource({
      opportunityType: "internship",
      text: "A custom listing a judge might paste instead of the sample.",
    });

    expect(extraction.title).toBe(DEMO_OPPORTUNITY_EXTRACTION.title);
    expect(fetchMock).not.toHaveBeenCalled();

    vi.unstubAllGlobals();
  });

  it("does not parse resume files in the public demo", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      parseDemoResumeFile(),
    ).rejects.toThrow(/sample resume/i);
    expect(fetchMock).not.toHaveBeenCalled();

    vi.unstubAllGlobals();
  });
});
