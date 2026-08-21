import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

import { getClientIp, hashClientIp } from "./rate-limit";

export type DemoAiRateLimitResult =
  | { success: true }
  | {
      success: false;
      type: "short-term" | "daily" | "global";
      reset: number;
    }
  | { success: false; type: "unavailable" };

type DemoLimiters = {
  shortTerm: Ratelimit;
  daily: Ratelimit;
  global: Ratelimit;
};

const DEMO_GLOBAL_IDENTIFIER = "global";

let limiters: DemoLimiters | undefined;

function isProduction() {
  return process.env.NODE_ENV === "production";
}

function hasUpstashConfig() {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL?.trim() &&
      process.env.UPSTASH_REDIS_REST_TOKEN?.trim(),
  );
}

function logProtectionUnavailable() {
  console.error("Public demo AI rate limit protection is unavailable.");
}

function protectionUnavailable(): DemoAiRateLimitResult {
  if (isProduction()) {
    logProtectionUnavailable();
    return { success: false, type: "unavailable" };
  }

  return { success: true };
}

function getLimiters(): DemoLimiters | null {
  if (!hasUpstashConfig()) {
    return null;
  }

  if (limiters) {
    return limiters;
  }

  try {
    const redis = Redis.fromEnv();

    limiters = {
      shortTerm: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(3, "30 m"),
        analytics: true,
        prefix: "mova:demo-ai:short",
      }),
      daily: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "1 d"),
        analytics: true,
        prefix: "mova:demo-ai:daily",
      }),
      global: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(25, "1 d"),
        analytics: true,
        prefix: "mova:demo-ai:global",
      }),
    };

    return limiters;
  } catch {
    return null;
  }
}

function retryAfterSeconds(reset: number) {
  return Math.max(1, Math.ceil((reset - Date.now()) / 1000));
}

export async function checkDemoAiRateLimit(
  request: Request,
): Promise<DemoAiRateLimitResult> {
  const currentLimiters = getLimiters();

  if (!currentLimiters) {
    return protectionUnavailable();
  }

  const ipIdentifier = `ip:${hashClientIp(getClientIp(request))}`;

  try {
    const short = await currentLimiters.shortTerm.limit(ipIdentifier);

    if (short.reason === "timeout") {
      return protectionUnavailable();
    }

    if (!short.success) {
      return {
        success: false,
        type: "short-term",
        reset: short.reset,
      };
    }

    const daily = await currentLimiters.daily.limit(ipIdentifier);

    if (daily.reason === "timeout") {
      return protectionUnavailable();
    }

    if (!daily.success) {
      return {
        success: false,
        type: "daily",
        reset: daily.reset,
      };
    }

    const global = await currentLimiters.global.limit(DEMO_GLOBAL_IDENTIFIER);

    if (global.reason === "timeout") {
      return protectionUnavailable();
    }

    if (!global.success) {
      return {
        success: false,
        type: "global",
        reset: global.reset,
      };
    }

    return { success: true };
  } catch {
    return protectionUnavailable();
  }
}

export function createDemoAiRateLimitResponse(
  result: Exclude<DemoAiRateLimitResult, { success: true }>,
) {
  if (result.type === "unavailable") {
    return NextResponse.json(
      { error: "AI service protection is temporarily unavailable." },
      { status: 503 },
    );
  }

  const error =
    result.type === "short-term"
      ? "Too many AI requests. Please wait a few minutes and try again."
      : "You've reached today's AI usage limit. Please try again later.";

  return NextResponse.json(
    { error },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSeconds(result.reset)),
      },
    },
  );
}
