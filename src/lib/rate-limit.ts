import { createHash } from "node:crypto";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

export type AiRateLimitResult =
  | { success: true }
  | {
      success: false;
      type: "short-term" | "daily";
      reset: number;
    }
  | { success: false; type: "unavailable" };

type Limiters = {
  shortTerm: Ratelimit;
  daily: Ratelimit;
};

let limiters: Limiters | undefined;

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
  console.error(
    "AI rate limit protection is unavailable.",
  );
}

function protectionUnavailable(): AiRateLimitResult {
  if (isProduction()) {
    logProtectionUnavailable();
    return { success: false, type: "unavailable" };
  }

  return { success: true };
}

function getLimiters(): Limiters | null {
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
        limiter: Ratelimit.slidingWindow(8, "10 m"),
        analytics: true,
        prefix: "mova:ai:short",
      }),
      daily: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(30, "1 d"),
        analytics: true,
        prefix: "mova:ai:daily",
      }),
    };

    return limiters;
  } catch {
    return null;
  }
}

export function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");

  if (forwarded) {
    const parts = forwarded
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    const ip = parts.at(-1);

    if (ip) {
      return ip;
    }
  }

  const realIp = request.headers.get("x-real-ip")?.trim();

  if (realIp) {
    return realIp;
  }

  return "unknown";
}

export function hashClientIp(ip: string) {
  return createHash("sha256").update(ip).digest("hex");
}

function retryAfterSeconds(reset: number) {
  return Math.max(1, Math.ceil((reset - Date.now()) / 1000));
}

async function limitIdentifier(
  currentLimiters: Limiters,
  identifier: string,
): Promise<AiRateLimitResult> {
  const short = await currentLimiters.shortTerm.limit(identifier);

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

  const daily = await currentLimiters.daily.limit(identifier);

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

  return { success: true };
}

export async function checkAiRateLimit(
  request: Request,
  options: { userId: string },
): Promise<AiRateLimitResult> {
  const currentLimiters = getLimiters();

  if (!currentLimiters) {
    return protectionUnavailable();
  }

  const ipIdentifier = `ip:${hashClientIp(getClientIp(request))}`;
  const userIdentifier = `user:${options.userId}`;

  try {
    const ipResult = await limitIdentifier(
      currentLimiters,
      ipIdentifier,
    );

    if (!ipResult.success) {
      return ipResult;
    }

    return await limitIdentifier(
      currentLimiters,
      userIdentifier,
    );
  } catch {
    return protectionUnavailable();
  }
}

export function createRateLimitResponse(
  result: Exclude<AiRateLimitResult, { success: true }>,
) {
  if (result.type === "unavailable") {
    return NextResponse.json(
      { error: "AI demo protection is temporarily unavailable." },
      { status: 503 },
    );
  }

  const error =
    result.type === "daily"
      ? "You've reached today's demo usage limit. Please try again later."
      : "Too many AI requests. Please wait a few minutes and try again.";

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
