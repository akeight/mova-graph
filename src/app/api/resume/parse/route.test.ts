import { beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "./route";

import { getAuthenticatedUser } from
  "@/features/auth/services/session";
import { parseResumeDocument } from
  "@/features/resume-import/services/parse-resume-document";
import { validateResumeFile } from
  "@/features/resume-import/services/validate-resume-file";

vi.mock("@/features/auth/services/session", () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock("@/features/resume-import/services/parse-resume-document", () => ({
  parseResumeDocument: vi.fn(),
  ResumeParseError: class ResumeParseError extends Error {
    code = "image-only-pdf";
  },
}));

vi.mock("@/features/resume-import/services/validate-resume-file", () => ({
  validateResumeFile: vi.fn(),
}));

const mockedGetUser = vi.mocked(getAuthenticatedUser);
const mockedParse = vi.mocked(parseResumeDocument);
const mockedValidate = vi.mocked(validateResumeFile);

function makeRequest(file?: File) {
  const body = new FormData();

  if (file) {
    body.set("file", file);
  }

  return new Request("http://localhost/api/resume/parse", {
    method: "POST",
    body,
  });
}

describe("POST /api/resume/parse", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockedGetUser.mockResolvedValue(null);

    const response = await POST(makeRequest());

    expect(response.status).toBe(401);
    expect(mockedParse).not.toHaveBeenCalled();
  });

  it("parses an authenticated upload", async () => {
    mockedGetUser.mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
    } as Awaited<ReturnType<typeof getAuthenticatedUser>>);
    mockedValidate.mockReturnValue({ ok: true, kind: "pdf" });
    mockedParse.mockResolvedValue(
      "Software Engineering Intern at Acme. Built a Next.js dashboard.",
    );

    const file = new File(
      ["%PDF-1.4 fake"],
      "software-engineering.pdf",
      { type: "application/pdf" },
    );
    const response = await POST(makeRequest(file));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.displayName).toBe("software-engineering.pdf");
    expect(body.text).toContain("Next.js");
  });
});
