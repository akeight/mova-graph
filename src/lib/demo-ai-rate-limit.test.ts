import { createHash } from "node:crypto";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  checkDemoAiRateLimit,
  createDemoAiRateLimitResponse,
} from "./demo-ai-rate-limit";
import { hashClientIp } from "./rate-limit";

const { shortLimit, dailyLimit, globalLimit } = vi.hoisted(() => ({
  shortLimit: vi.fn(),
  dailyLimit: vi.fn(),
  globalLimit: vi.fn(),
}));

vi.mock("@upstash/redis", () => ({
  Redis: {
    fromEnv: vi.fn(() => ({})),
  },
}));

vi.mock("@upstash/ratelimit", () => {
  class Ratelimit {
    static slidingWindow(limit: number, window: string) {
      return { limit, window };
    }

    limit: typeof shortLimit;

    constructor(config: { prefix: string }) {
      if (config.prefix === "mova:demo-ai:short") {
        this.limit = shortLimit;
        return;
      }

      if (config.prefix === "mova:demo-ai:daily") {
        this.limit = dailyLimit;
        return;
      }

      this.limit = globalLimit;
    }
  }

  return { Ratelimit };
});

function allowedLimit(reset = Date.now() + 60_000) {
  return {
    success: true,
    limit: 3,
    remaining: 2,
    reset,
    pending: Promise.resolve(),
  };
}

function blockedLimit(reset = Date.now() + 30_000) {
  return {
    success: false,
    limit: 3,
    remaining: 0,
    reset,
    pending: Promise.resolve(),
  };
}

function makeRequest(headers?: HeadersInit) {
  return new Request("http://localhost/api/demo/extract-resume", {
    method: "POST",
    headers,
  });
}

function enableRedisConfig() {
  vi.stubEnv(
    "UPSTASH_REDIS_REST_URL",
    "https://example.upstash.io",
  );
  vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "test-token");
}

describe("checkDemoAiRateLimit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    shortLimit.mockResolvedValue(allowedLimit());
    dailyLimit.mockResolvedValue(allowedLimit());
    globalLimit.mockResolvedValue(allowedLimit());
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("allows requests in development when Redis is not configured", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");

    await expect(checkDemoAiRateLimit(makeRequest())).resolves.toEqual({
      success: true,
    });
    expect(shortLimit).not.toHaveBeenCalled();
  });

  it("fails closed in production when Redis is not configured", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");

    await expect(checkDemoAiRateLimit(makeRequest())).resolves.toEqual({
      success: false,
      type: "unavailable",
    });
    expect(shortLimit).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(
      "Public demo AI rate limit protection is unavailable.",
    );
  });

  it("limits by hashed IP and a global identifier, never the raw IP", async () => {
    enableRedisConfig();
    const ip = "203.0.113.9";

    await expect(
      checkDemoAiRateLimit(
        makeRequest({ "x-forwarded-for": `${ip}, 1.2.3.4` }),
      ),
    ).resolves.toEqual({ success: true });

    const hashedIp = `ip:${hashClientIp(ip)}`;

    expect(hashedIp).toBe(
      `ip:${createHash("sha256").update(ip).digest("hex")}`,
    );
    expect(shortLimit).toHaveBeenCalledWith(hashedIp);
    expect(dailyLimit).toHaveBeenCalledWith(hashedIp);
    expect(globalLimit).toHaveBeenCalledWith("global");
    expect(shortLimit.mock.calls.flat()).not.toContain(ip);
    expect(dailyLimit.mock.calls.flat()).not.toContain(ip);
    expect(globalLimit.mock.calls.flat()).not.toContain(ip);
  });

  it("enforces the short-term per-IP limit before daily or global", async () => {
    enableRedisConfig();
    const reset = Date.now() + 12_000;
    shortLimit.mockResolvedValueOnce(blockedLimit(reset));

    await expect(checkDemoAiRateLimit(makeRequest())).resolves.toEqual({
      success: false,
      type: "short-term",
      reset,
    });
    expect(dailyLimit).not.toHaveBeenCalled();
    expect(globalLimit).not.toHaveBeenCalled();
  });

  it("enforces the per-IP daily limit before the global limit", async () => {
    enableRedisConfig();
    const reset = Date.now() + 86_400_000;
    dailyLimit.mockResolvedValueOnce(blockedLimit(reset));

    await expect(checkDemoAiRateLimit(makeRequest())).resolves.toEqual({
      success: false,
      type: "daily",
      reset,
    });
    expect(globalLimit).not.toHaveBeenCalled();
  });

  it("enforces the global daily limit after IP limits succeed", async () => {
    enableRedisConfig();
    const reset = Date.now() + 86_400_000;
    globalLimit.mockResolvedValueOnce(blockedLimit(reset));

    await expect(checkDemoAiRateLimit(makeRequest())).resolves.toEqual({
      success: false,
      type: "global",
      reset,
    });
  });

  it("fails closed in production when Redis times out", async () => {
    enableRedisConfig();
    vi.stubEnv("NODE_ENV", "production");
    shortLimit.mockResolvedValueOnce({
      ...allowedLimit(),
      reason: "timeout",
    });

    await expect(checkDemoAiRateLimit(makeRequest())).resolves.toEqual({
      success: false,
      type: "unavailable",
    });
  });

  it("fails closed in production when Redis throws", async () => {
    enableRedisConfig();
    vi.stubEnv("NODE_ENV", "production");
    shortLimit.mockRejectedValueOnce(new Error("network down"));

    await expect(checkDemoAiRateLimit(makeRequest())).resolves.toEqual({
      success: false,
      type: "unavailable",
    });
  });
});

describe("createDemoAiRateLimitResponse", () => {
  it("returns 429 with Retry-After for a short-term limit", async () => {
    const response = createDemoAiRateLimitResponse({
      success: false,
      type: "short-term",
      reset: Date.now() + 4_500,
    });
    const body = await response.json();

    expect(response.status).toBe(429);
    expect(body).toEqual({
      error:
        "Too many AI requests. Please wait a few minutes and try again.",
    });
    expect(Number(response.headers.get("Retry-After"))).toBeGreaterThanOrEqual(
      1,
    );
  });

  it("returns 429 for daily and global limits", async () => {
    for (const type of ["daily", "global"] as const) {
      const response = createDemoAiRateLimitResponse({
        success: false,
        type,
        reset: Date.now() + 60_000,
      });

      expect(response.status).toBe(429);
      expect(await response.json()).toEqual({
        error:
          "You've reached today's AI usage limit. Please try again later.",
      });
    }
  });

  it("returns 503 when protection is unavailable", async () => {
    const response = createDemoAiRateLimitResponse({
      success: false,
      type: "unavailable",
    });

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error: "AI service protection is temporarily unavailable.",
    });
  });
});
