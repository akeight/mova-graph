import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "./route";

import { getAuthenticatedUser } from
  "@/features/auth/services/session";
import { extractOpportunity } from
  "@/features/opportunity-what-if/services/extract-opportunity";
import { checkAiRateLimit } from "@/lib/rate-limit";

vi.mock("@/features/auth/services/session", () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock("@/lib/rate-limit", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/rate-limit")>();

  return {
    ...actual,
    checkAiRateLimit: vi.fn(),
  };
});

vi.mock(
  "@/features/opportunity-what-if/services/extract-opportunity",
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import("@/features/opportunity-what-if/services/extract-opportunity")
      >();

    return {
      ...actual,
      extractOpportunity: vi.fn(),
    };
  },
);

const mockedGetUser = vi.mocked(getAuthenticatedUser);
const mockedExtract = vi.mocked(extractOpportunity);
const mockedCheckAiRateLimit = vi.mocked(checkAiRateLimit);

function makeUser() {
  return {
    id: "user-1",
    email: "user@example.com",
  } as Awaited<ReturnType<typeof getAuthenticatedUser>>;
}

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/ai/extract-opportunity", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const originalKey = process.env.OPENAI_API_KEY;
const validBody = {
  opportunityType: "internship",
  text: "Software Engineering Intern. Build React interfaces and write tests.",
};

describe("POST /api/ai/extract-opportunity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.OPENAI_API_KEY = "test-key";
    mockedGetUser.mockResolvedValue(makeUser());
    mockedCheckAiRateLimit.mockResolvedValue({ success: true });
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();

    if (originalKey === undefined) {
      delete process.env.OPENAI_API_KEY;
    } else {
      process.env.OPENAI_API_KEY = originalKey;
    }
  });

  it("returns 401 when unauthenticated", async () => {
    mockedGetUser.mockResolvedValue(null);

    const response = await POST(makeRequest(validBody));

    expect(response.status).toBe(401);
    expect(mockedExtract).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid requests", async () => {
    const response = await POST(
      makeRequest({ opportunityType: "internship", text: "too short" }),
    );

    expect(response.status).toBe(400);
    expect(mockedExtract).not.toHaveBeenCalled();
  });

  it("returns 503 when the API key is missing", async () => {
    delete process.env.OPENAI_API_KEY;

    const response = await POST(makeRequest(validBody));

    expect(response.status).toBe(503);
    expect(mockedExtract).not.toHaveBeenCalled();
  });

  it("returns a sanitized 500 without logging the pasted text", async () => {
    mockedExtract.mockRejectedValue(new Error("provider down"));

    const response = await POST(makeRequest(validBody));
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload.error).toBe(
      "Mova could not analyze that opportunity. Please try again.",
    );
    expect(JSON.stringify(payload)).not.toContain(validBody.text);
    expect(vi.mocked(console.error)).toHaveBeenCalledWith(
      "Opportunity extraction failed:",
      expect.not.stringContaining(validBody.text),
    );
  });

  it("returns the extraction for an authenticated request", async () => {
    mockedExtract.mockResolvedValue({
      opportunityType: "internship",
      title: "Software Engineering Intern",
      description: "Build React interfaces.",
      skills: [],
    });

    const response = await POST(makeRequest(validBody));

    expect(response.status).toBe(200);
    expect(mockedExtract).toHaveBeenCalledWith(validBody);
  });
});
