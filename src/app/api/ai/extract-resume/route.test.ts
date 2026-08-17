import { beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "./route";

import { getAuthenticatedUser } from
  "@/features/auth/services/session";
import { extractResume } from
  "@/features/resume-import/services/extract-resume";

vi.mock("@/features/auth/services/session", () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock("@/features/resume-import/services/extract-resume", () => ({
  extractResume: vi.fn(),
}));

const mockedGetUser = vi.mocked(getAuthenticatedUser);
const mockedExtract = vi.mocked(extractResume);

describe("POST /api/ai/extract-resume", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.OPENAI_API_KEY = "test-key";
  });

  it("returns 401 when unauthenticated", async () => {
    mockedGetUser.mockResolvedValue(null);

    const response = await POST(
      new Request("http://localhost/api/ai/extract-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceId: "source-1",
          displayName: "resume.pdf",
          text: "Software Engineering Intern at Acme. Built a Next.js dashboard using TypeScript.",
        }),
      }),
    );

    expect(response.status).toBe(401);
    expect(mockedExtract).not.toHaveBeenCalled();
  });
});
