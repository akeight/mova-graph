import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { APICallError, generateText, NoObjectGeneratedError } from "ai";

import { POST } from "./route";

import { getAuthenticatedUser } from
  "@/features/auth/services/session";
import type {
  RawResumeExtraction,
  RawResumeItem,
} from "@/features/resume-import/schemas/resume-extraction";
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

vi.mock("ai", async (importOriginal) => {
  const actual = await importOriginal<typeof import("ai")>();

  return {
    ...actual,
    generateText: vi.fn(),
  };
});

const mockedGetUser = vi.mocked(getAuthenticatedUser);
const mockedGenerateText = vi.mocked(generateText);
const mockedCheckAiRateLimit = vi.mocked(checkAiRateLimit);

const PASTED_RESUME = [
  "Jordan Lee",
  "B.S. Computer Science, State University, 2022-2026",
  "Software Engineering Intern — Acme",
  "Built a Next.js dashboard using TypeScript.",
  "Catalyst",
  "Built a React dashboard for internship tracking.",
  "Skills: AWS, Docker",
].join("\n");

function makeUser() {
  return {
    id: "user-1",
    email: "user@example.com",
  } as Awaited<ReturnType<typeof getAuthenticatedUser>>;
}

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

const validRaw = extraction({
  candidateName: "Jordan Lee",
  program: "B.S. Computer Science",
  institution: "State University",
  skillsSectionExcerpt: "Skills: AWS, Docker",
  items: [
    item({
      kind: "work",
      title: "Software Engineering Intern",
      organization: "Acme",
      sourceExcerpt:
        "Software Engineering Intern — Acme\nBuilt a Next.js dashboard using TypeScript.",
      skills: [
        {
          sourcePhrase: "Next.js",
          evidence: "Built a Next.js dashboard using TypeScript.",
          mappings: [{ canonicalSkillId: "nextjs", confidence: 0.95 }],
        },
      ],
    }),
    item({
      kind: "project",
      title: "Catalyst",
      sourceExcerpt: "Catalyst\nBuilt a React dashboard for internship tracking.",
      skills: [
        {
          sourcePhrase: "React",
          evidence: "Built a React dashboard for internship tracking.",
          mappings: [{ canonicalSkillId: "react", confidence: 0.94 }],
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
});

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/ai/extract-resume", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const originalKey = process.env.ANTHROPIC_API_KEY;

describe("POST /api/ai/extract-resume", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ANTHROPIC_API_KEY = "test-key";
    mockedGetUser.mockResolvedValue(makeUser());
    mockedCheckAiRateLimit.mockResolvedValue({ success: true });
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();

    if (originalKey === undefined) {
      delete process.env.ANTHROPIC_API_KEY;
    } else {
      process.env.ANTHROPIC_API_KEY = originalKey;
    }
  });

  it("returns 401 when unauthenticated", async () => {
    mockedGetUser.mockResolvedValue(null);

    const response = await POST(
      makeRequest({
        sourceId: "source-1",
        displayName: "Pasted resume",
        text: PASTED_RESUME,
      }),
    );

    expect(response.status).toBe(401);
    expect(mockedCheckAiRateLimit).not.toHaveBeenCalled();
    expect(mockedGenerateText).not.toHaveBeenCalled();
  });

  it("returns 503 when ANTHROPIC_API_KEY is missing", async () => {
    delete process.env.ANTHROPIC_API_KEY;

    const response = await POST(
      makeRequest({
        sourceId: "source-1",
        displayName: "Pasted resume",
        text: PASTED_RESUME,
      }),
    );

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error: "AI extraction is not configured.",
    });
    expect(mockedGenerateText).not.toHaveBeenCalled();
  });

  it("returns 400 for an invalid request body", async () => {
    const response = await POST(
      makeRequest({
        sourceId: "source-1",
        displayName: "Pasted resume",
        text: "too short",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("That resume could not be analyzed.");
    expect(mockedCheckAiRateLimit).not.toHaveBeenCalled();
    expect(mockedGenerateText).not.toHaveBeenCalled();
  });

  it("returns a usable draft for an authenticated valid pasted resume", async () => {
    mockedGenerateText.mockResolvedValue({
      output: validRaw,
    } as Awaited<ReturnType<typeof generateText>>);

    const response = await POST(
      makeRequest({
        sourceId: "source-1",
        displayName: "Pasted resume",
        text: PASTED_RESUME,
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.proposedName).toBe("Jordan Lee");
    expect(body.program).toBe("B.S. Computer Science");
    expect(body.items.map((entry: { title: string }) => entry.title)).toEqual([
      "Software Engineering Intern",
      "Catalyst",
    ]);
    expect(
      body.standaloneSkills.map((skill: { id: string }) => skill.id),
    ).toContain("aws");
    expect(mockedCheckAiRateLimit).toHaveBeenCalledOnce();
    expect(mockedGenerateText).toHaveBeenCalledOnce();
  });

  it("returns 429 when the short-term AI rate limit is exceeded", async () => {
    mockedCheckAiRateLimit.mockResolvedValue({
      success: false,
      type: "short-term",
      reset: Date.now() + 30_000,
    });

    const response = await POST(
      makeRequest({
        sourceId: "source-1",
        displayName: "Pasted resume",
        text: PASTED_RESUME,
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(429);
    expect(body.error).toBe(
      "Too many AI requests. Please wait a few minutes and try again.",
    );
    expect(Number(response.headers.get("Retry-After"))).toBeGreaterThanOrEqual(
      1,
    );
    expect(mockedGenerateText).not.toHaveBeenCalled();
  });

  it("returns 429 when the daily AI rate limit is exceeded", async () => {
    mockedCheckAiRateLimit.mockResolvedValue({
      success: false,
      type: "daily",
      reset: Date.now() + 3_600_000,
    });

    const response = await POST(
      makeRequest({
        sourceId: "source-1",
        displayName: "Pasted resume",
        text: PASTED_RESUME,
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(429);
    expect(body.error).toBe(
      "You've reached today's AI usage limit. Please try again later.",
    );
    expect(Number(response.headers.get("Retry-After"))).toBeGreaterThanOrEqual(
      1,
    );
    expect(mockedGenerateText).not.toHaveBeenCalled();
  });

  it("returns 503 when AI rate-limit storage is unavailable", async () => {
    mockedCheckAiRateLimit.mockResolvedValue({
      success: false,
      type: "unavailable",
    });

    const response = await POST(
      makeRequest({
        sourceId: "source-1",
        displayName: "Pasted resume",
        text: PASTED_RESUME,
      }),
    );

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error: "AI service protection is temporarily unavailable.",
    });
    expect(mockedGenerateText).not.toHaveBeenCalled();
  });

  it("returns 500 with a controlled message when the model request fails", async () => {
    mockedGenerateText.mockRejectedValue(
      new APICallError({
        message: "Invalid schema",
        url: "https://api.openai.com/v1/responses",
        requestBodyValues: { prompt: "SHOULD-NOT-LEAK-RESUME" },
        statusCode: 400,
        data: {
          error: {
            code: "invalid_json_schema",
            message: "Missing organization",
          },
        },
      }),
    );

    const response = await POST(
      makeRequest({
        sourceId: "source-1",
        displayName: "Pasted resume",
        text: PASTED_RESUME,
      }),
    );
    const body = await response.json();
    const serialized = JSON.stringify(body);

    expect(response.status).toBe(500);
    expect(body.error).toBe(
      "Mova could not analyze that resume. Please try again.",
    );
    expect(serialized).not.toContain("SHOULD-NOT-LEAK-RESUME");
    expect(body.debug).toMatchObject({
      stage: "model-request",
      providerStatus: 400,
      providerCode: "invalid_json_schema",
    });
    expect(console.error).toHaveBeenCalledWith(
      "Resume extraction failed:",
      expect.objectContaining({
        stage: "model-request",
        providerStatus: 400,
        providerCode: "invalid_json_schema",
      }),
    );
  });

  it("returns 500 when structured output cannot be generated", async () => {
    mockedGenerateText.mockRejectedValue(
      new NoObjectGeneratedError({
        message: "No object generated: response did not match schema.",
        cause: {
          issues: [{ path: ["items", 0, "sourceExcerpt"], code: "too_small" }],
        } as unknown as Error,
        text: PASTED_RESUME,
        response: {
          id: "resp-1",
          timestamp: new Date(),
          modelId: "gpt-5-mini",
        },
        usage: {
          inputTokens: 1,
          outputTokens: 1,
          totalTokens: 2,
          inputTokenDetails: {
            noCacheTokens: 1,
            cacheReadTokens: undefined,
            cacheWriteTokens: undefined,
          },
          outputTokenDetails: {
            textTokens: 1,
            reasoningTokens: undefined,
          },
        },
        finishReason: "stop",
      }),
    );

    const response = await POST(
      makeRequest({
        sourceId: "source-1",
        displayName: "Pasted resume",
        text: PASTED_RESUME,
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe(
      "Mova could not analyze that resume. Please try again.",
    );
    expect(JSON.stringify(body)).not.toContain(PASTED_RESUME);
    expect(body.debug).toMatchObject({
      stage: "structured-output",
    });
  });

  it("returns 422 when grounded extraction is empty", async () => {
    mockedGenerateText.mockResolvedValue({
      output: extraction({
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
    } as Awaited<ReturnType<typeof generateText>>);

    const response = await POST(
      makeRequest({
        sourceId: "source-1",
        displayName: "Pasted resume",
        text: PASTED_RESUME,
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.error).toMatch(/grounded experience/i);
    expect(body.debug).toMatchObject({
      stage: "normalization-empty",
    });
  });
});
