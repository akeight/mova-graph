import { beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "./route";

import { getAuthenticatedUser } from
  "@/features/auth/services/session";
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

vi.mock("@/features/skill-analysis/services/extract-profile-item", () => ({
  extractProfileItem: vi.fn(),
}));

const mockedGetUser = vi.mocked(getAuthenticatedUser);
const mockedCheckAiRateLimit = vi.mocked(checkAiRateLimit);

describe("POST /api/ai/extract-profile-item", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedCheckAiRateLimit.mockResolvedValue({ success: true });
  });

  it("returns 401 when unauthenticated", async () => {
    mockedGetUser.mockResolvedValue(null);

    const response = await POST(
      new Request("http://localhost/api/ai/extract-profile-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "experience",
          text: "Built a Next.js dashboard using TypeScript.",
        }),
      }),
    );

    expect(response.status).toBe(401);
  });
});
