import { createHash } from "node:crypto";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  checkAiRateLimit,
  createRateLimitResponse,
  getClientIp,
  hashClientIp,
} from "./rate-limit";

const { shortLimit, dailyLimit } = vi.hoisted(() => ({
  shortLimit: vi.fn(),
  dailyLimit: vi.fn(),
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
      this.limit =
        config.prefix === "mova:ai:short" ? shortLimit : dailyLimit;
    }
  }

  return { Ratelimit };
});

function allowedLimit(reset = Date.now() + 60_000) {
  return {
    success: true,
    limit: 8,
    remaining: 7,
    reset,
    pending: Promise.resolve(),
  };
}

function blockedLimit(reset = Date.now() + 30_000) {
  return {
    success: false,
    limit: 8,
    remaining: 0,
    reset,
    pending: Promise.resolve(),
  };
}

function makeRequest(headers?: HeadersInit) {
  return new Request("http://localhost/api/ai/extract-resume", {
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

describe("getClientIp", () => {
  it("prefers x-vercel-forwarded-for over other IP headers", () => {
    const request = makeRequest({
      "x-vercel-forwarded-for": "203.0.113.9",
      "x-forwarded-for": "198.51.100.2, 192.0.2.1",
      "x-real-ip": "192.0.2.8",
    });

    expect(getClientIp(request)).toBe("203.0.113.9");
  });

  it("uses the first x-forwarded-for address", () => {
    const request = makeRequest({
      "x-forwarded-for": "203.0.113.1, 198.51.100.2",
    });

    expect(getClientIp(request)).toBe("203.0.113.1");
  });

  it("trims addresses in a forwarded list", () => {
    const request = makeRequest({
      "x-forwarded-for": " 203.0.113.1 ,  198.51.100.2 ",
    });

    expect(getClientIp(request)).toBe("203.0.113.1");
  });

  it("falls back to x-real-ip", () => {
    const request = makeRequest({
      "x-real-ip": " 203.0.113.9 ",
    });

    expect(getClientIp(request)).toBe("203.0.113.9");
  });

  it("falls back to unknown when no IP headers are present", () => {
    expect(getClientIp(makeRequest())).toBe("unknown");
  });
});

describe("hashClientIp", () => {
  it("returns a SHA-256 hex digest instead of the raw IP", () => {
    const ip = "203.0.113.9";
    const digest = hashClientIp(ip);

    expect(digest).toBe(
      createHash("sha256").update(ip).digest("hex"),
    );
    expect(digest).not.toBe(ip);
  });
});

describe("createRateLimitResponse", () => {
  it("returns 429 with Retry-After for a short-term limit", async () => {
    const response = createRateLimitResponse({
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

  it("returns 429 with the daily-limit message", async () => {
    const response = createRateLimitResponse({
      success: false,
      type: "daily",
      reset: Date.now() + 60_000,
    });

    expect(response.status).toBe(429);
    expect(await response.json()).toEqual({
      error:
        "You've reached today's AI usage limit. Please try again later.",
    });
  });

  it("uses a minimum Retry-After of 1 second", () => {
    const response = createRateLimitResponse({
      success: false,
      type: "short-term",
      reset: Date.now() - 5_000,
    });

    expect(response.headers.get("Retry-After")).toBe("1");
  });

  it("returns 503 when protection is unavailable", async () => {
    const response = createRateLimitResponse({
      success: false,
      type: "unavailable",
    });

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error: "AI service protection is temporarily unavailable.",
    });
  });
});

describe("checkAiRateLimit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    shortLimit.mockResolvedValue(allowedLimit());
    dailyLimit.mockResolvedValue(allowedLimit());
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("allows requests in development when Redis is not configured", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");

    await expect(
      checkAiRateLimit(makeRequest(), { userId: "user-1" }),
    ).resolves.toEqual({ success: true });
    expect(shortLimit).not.toHaveBeenCalled();
  });

  it("fails closed in production when Redis is not configured", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");

    await expect(
      checkAiRateLimit(makeRequest(), { userId: "user-1" }),
    ).resolves.toEqual({ success: false, type: "unavailable" });
    expect(shortLimit).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(
      "AI rate limit protection is unavailable.",
    );
  });

  it("limits by hashed IP and user id without storing the raw IP", async () => {
    enableRedisConfig();
    const ip = "203.0.113.9";

    await expect(
      checkAiRateLimit(
        makeRequest({ "x-forwarded-for": `${ip}, 1.2.3.4` }),
        { userId: "user-1" },
      ),
    ).resolves.toEqual({ success: true });

    const hashedIp = `ip:${hashClientIp(ip)}`;

    expect(shortLimit).toHaveBeenCalledWith(hashedIp);
    expect(shortLimit).toHaveBeenCalledWith("user:user-1");
    expect(dailyLimit).toHaveBeenCalledWith(hashedIp);
    expect(dailyLimit).toHaveBeenCalledWith("user:user-1");
    expect(shortLimit.mock.calls.flat()).not.toContain(ip);
    expect(dailyLimit.mock.calls.flat()).not.toContain(ip);
  });

  it("returns the short-term limit when the sliding window is exceeded", async () => {
    enableRedisConfig();
    const reset = Date.now() + 12_000;
    shortLimit.mockResolvedValueOnce(blockedLimit(reset));

    await expect(
      checkAiRateLimit(makeRequest(), { userId: "user-1" }),
    ).resolves.toEqual({
      success: false,
      type: "short-term",
      reset,
    });
    expect(dailyLimit).not.toHaveBeenCalled();
  });

  it("returns the daily limit when the daily window is exceeded", async () => {
    enableRedisConfig();
    const reset = Date.now() + 86_400_000;
    dailyLimit.mockResolvedValueOnce(blockedLimit(reset));

    await expect(
      checkAiRateLimit(makeRequest(), { userId: "user-1" }),
    ).resolves.toEqual({
      success: false,
      type: "daily",
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

    await expect(
      checkAiRateLimit(makeRequest(), { userId: "user-1" }),
    ).resolves.toEqual({ success: false, type: "unavailable" });
  });

  it("fails closed in production when Redis throws", async () => {
    enableRedisConfig();
    vi.stubEnv("NODE_ENV", "production");
    shortLimit.mockRejectedValueOnce(new Error("network down"));

    await expect(
      checkAiRateLimit(makeRequest(), { userId: "user-1" }),
    ).resolves.toEqual({ success: false, type: "unavailable" });
  });
});
