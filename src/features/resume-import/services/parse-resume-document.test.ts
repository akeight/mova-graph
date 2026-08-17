import { beforeEach, describe, expect, it, vi } from "vitest";

import { extractText } from "unpdf";

import { parseResumeDocument, ResumeParseError } from
  "./parse-resume-document";

vi.mock("unpdf", () => ({
  extractText: vi.fn(),
}));

vi.mock("mammoth", () => ({
  default: {
    extractRawText: vi.fn(),
  },
}));

const mockedExtractText = vi.mocked(extractText);

describe("parseResumeDocument", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns extracted PDF text", async () => {
    mockedExtractText.mockResolvedValue({
      totalPages: 1,
      text: "Software Engineering Intern at Acme. Built a Next.js dashboard using TypeScript and tested APIs.",
    });

    await expect(
      parseResumeDocument({
        kind: "pdf",
        bytes: new Uint8Array([1, 2, 3]),
      }),
    ).resolves.toContain("Software Engineering Intern");
  });

  it("rejects image-only PDFs without OCR", async () => {
    mockedExtractText.mockResolvedValue({
      totalPages: 1,
      text: "   ",
    });

    await expect(
      parseResumeDocument({
        kind: "pdf",
        bytes: new Uint8Array([1, 2, 3]),
      }),
    ).rejects.toMatchObject({
      code: "image-only-pdf",
    } satisfies Partial<ResumeParseError>);
  });
});
