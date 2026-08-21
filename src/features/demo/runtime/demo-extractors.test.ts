import { describe, expect, it, vi } from "vitest";

import { DEMO_OPPORTUNITY_EXTRACTION } from
  "../data/demo-opportunity";
import { DEMO_RESUME_DRAFT } from "../data/demo-resume";
import {
  DEMO_LIVE_EXTRACTION_HEADER,
  DEMO_LIVE_EXTRACTION_VALUE,
  DEMO_RESUME_EXTRACT_PATH,
  DEMO_RESUME_EXTRACT_TIMEOUT_MS,
  getLastDemoResumeExtractionMode,
} from "./demo-live-extraction";

import {
  extractDemoOpportunitySource,
  extractDemoResumeSource,
  parseDemoResumeFile,
} from "./demo-extractors";

function liveResponse(body: unknown, header = true) {
  const headers = new Headers({ "Content-Type": "application/json" });

  if (header) {
    headers.set(DEMO_LIVE_EXTRACTION_HEADER, DEMO_LIVE_EXTRACTION_VALUE);
  }

  return new Response(JSON.stringify(body), {
    status: 200,
    headers,
  });
}

describe("demo extractors", () => {
  it("returns a live draft when the demo endpoint succeeds", async () => {
    const liveDraft = {
      ...structuredClone(DEMO_RESUME_DRAFT),
      proposedName: "Live Allyson",
    };
    const fetchMock = vi.fn().mockResolvedValue(liveResponse(liveDraft));
    vi.stubGlobal("fetch", fetchMock);

    const draft = await extractDemoResumeSource({
      sourceId: "ignored",
      displayName: "ignored",
      text: "a judge cannot change the analyzed sample this way",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      DEMO_RESUME_EXTRACT_PATH,
      expect.objectContaining({
        method: "POST",
        body: "{}",
      }),
    );
    expect(draft.proposedName).toBe("Live Allyson");
    expect(getLastDemoResumeExtractionMode()).toBe("live");

    vi.unstubAllGlobals();
  });

  it("falls back to the fixture when the live header is missing", async () => {
    const fetchMock = vi.fn().mockResolvedValue(liveResponse(DEMO_RESUME_DRAFT, false));
    vi.stubGlobal("fetch", fetchMock);

    const draft = await extractDemoResumeSource();

    expect(draft).toEqual(DEMO_RESUME_DRAFT);
    expect(getLastDemoResumeExtractionMode()).toBe("fallback");

    vi.unstubAllGlobals();
  });

  it.each([429, 503, 500])("falls back to the fixture on %s", async (status) => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: "unavailable" }), { status }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const draft = await extractDemoResumeSource();

    expect(draft.items).toHaveLength(DEMO_RESUME_DRAFT.items.length);
    expect(getLastDemoResumeExtractionMode()).toBe("fallback");

    vi.unstubAllGlobals();
  });

  it("falls back to the fixture on network rejection", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("offline"));
    vi.stubGlobal("fetch", fetchMock);

    await expect(extractDemoResumeSource()).resolves.toEqual(DEMO_RESUME_DRAFT);

    vi.unstubAllGlobals();
  });

  it("aborts live extraction after the demo timeout and uses the fixture", async () => {
    const timeoutSpy = vi.spyOn(AbortSignal, "timeout");
    const error = new Error("The operation was aborted");
    error.name = "AbortError";
    const fetchMock = vi.fn().mockRejectedValue(error);
    vi.stubGlobal("fetch", fetchMock);

    await expect(extractDemoResumeSource()).resolves.toEqual(DEMO_RESUME_DRAFT);
    expect(timeoutSpy).toHaveBeenCalledWith(DEMO_RESUME_EXTRACT_TIMEOUT_MS);
    expect(getLastDemoResumeExtractionMode()).toBe("fallback");

    timeoutSpy.mockRestore();
    vi.unstubAllGlobals();
  });

  it("falls back to the fixture for malformed live JSON", async () => {
    const fetchMock = vi.fn().mockResolvedValue(liveResponse({}));
    vi.stubGlobal("fetch", fetchMock);

    await expect(extractDemoResumeSource()).resolves.toEqual(DEMO_RESUME_DRAFT);
    expect(getLastDemoResumeExtractionMode()).toBe("fallback");

    vi.unstubAllGlobals();
  });

  it("falls back to the fixture when a live draft fails judge-readiness", async () => {
    const unsafe = {
      ...structuredClone(DEMO_RESUME_DRAFT),
      items: [
        {
          ...DEMO_RESUME_DRAFT.items[0],
          id: "generic-coursework",
          title: "Relevant Coursework",
        },
      ],
    };
    const fetchMock = vi.fn().mockResolvedValue(liveResponse(unsafe));
    vi.stubGlobal("fetch", fetchMock);

    await expect(extractDemoResumeSource()).resolves.toEqual(DEMO_RESUME_DRAFT);
    expect(getLastDemoResumeExtractionMode()).toBe("fallback");

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

    await expect(parseDemoResumeFile()).rejects.toThrow(/sample resume/i);
    expect(fetchMock).not.toHaveBeenCalled();

    vi.unstubAllGlobals();
  });
});
