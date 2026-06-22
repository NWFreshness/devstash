import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

function getIP(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "anonymous"
  );
}

function makeRatelimit(requests: number, windowSeconds: number) {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  return new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(requests, `${windowSeconds} s`),
    ephemeralCache: new Map(),
  });
}

// Singleton limiters (created once per cold start)
const limiters = {
  login: makeRatelimit(5, 15 * 60),
  register: makeRatelimit(3, 60 * 60),
  forgotPassword: makeRatelimit(3, 60 * 60),
  resetPassword: makeRatelimit(5, 15 * 60),
  resendVerification: makeRatelimit(3, 15 * 60),
  aiTag: makeRatelimit(20, 60 * 60),
} as const;

type LimiterKey = keyof typeof limiters;

export async function checkRateLimit(
  req: Request,
  limiterKey: LimiterKey,
  identifier?: string,
): Promise<NextResponse | null> {
  const limiter = limiters[limiterKey];
  if (!limiter) return null; // fail open when Upstash not configured

  const ip = getIP(req);
  const key = identifier ? `${ip}:${identifier}` : ip;

  let result;
  try {
    result = await limiter.limit(key);
  } catch {
    return null; // fail open on Upstash errors
  }

  if (!result.success) {
    const resetInSeconds = Math.ceil((result.reset - Date.now()) / 1000);
    const minutes = Math.ceil(resetInSeconds / 60);
    return NextResponse.json(
      { error: `Too many attempts. Please try again in ${minutes} minute${minutes === 1 ? "" : "s"}.` },
      {
        status: 429,
        headers: { "Retry-After": String(resetInSeconds) },
      },
    );
  }

  return null;
}

export async function checkAiRateLimit(userId: string): Promise<string | null> {
  const limiter = limiters.aiTag;
  if (!limiter) return null; // fail open when Upstash not configured

  let result;
  try {
    result = await limiter.limit(userId);
  } catch {
    return null; // fail open on Upstash errors
  }

  if (!result.success) {
    const resetInSeconds = Math.ceil((result.reset - Date.now()) / 1000);
    const minutes = Math.ceil(resetInSeconds / 60);
    return `AI rate limit reached. Please try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`;
  }

  return null;
}
