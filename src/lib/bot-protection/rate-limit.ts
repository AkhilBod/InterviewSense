/**
 * Rate Limiter using Upstash Redis
 * 
 * Serverless-compatible rate limiting for Vercel.
 * Uses sliding window algorithm for smooth limiting.
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { BOT_CONFIG, classifyRoute } from './config';

// Initialize Redis client (will be undefined if env vars not set)
let redis: Redis | null = null;
let rateLimiters: Map<string, Ratelimit> = new Map();

function getRedis(): Redis | null {
  if (redis) return redis;
  
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  
  if (!url || !token) {
    console.warn('[RateLimiter] Upstash credentials not configured. Rate limiting disabled.');
    return null;
  }

  redis = new Redis({ url, token });
  return redis;
}

function getRateLimiter(routeType: keyof typeof BOT_CONFIG.rateLimits): Ratelimit | null {
  const r = getRedis();
  if (!r) return null;

  const key = routeType;
  if (rateLimiters.has(key)) {
    return rateLimiters.get(key)!;
  }

  const config = BOT_CONFIG.rateLimits[routeType];
  
  // Use sliding window for smoother limiting
  const limiter = new Ratelimit({
    redis: r,
    limiter: Ratelimit.slidingWindow(config.requests, `${config.windowSeconds} s`),
    analytics: true,
    prefix: `ratelimit:${key}`,
  });

  rateLimiters.set(key, limiter);
  return limiter;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

/**
 * Check rate limit for a request
 */
export async function checkRateLimit(
  identifier: string,
  pathname: string
): Promise<RateLimitResult> {
  const routeType = classifyRoute(pathname);
  const limiter = getRateLimiter(routeType);

  // If no rate limiter configured, allow all
  if (!limiter) {
    const config = BOT_CONFIG.rateLimits[routeType];
    return {
      success: true,
      limit: config.requests,
      remaining: config.requests,
      reset: Date.now() + config.windowSeconds * 1000,
    };
  }

  try {
    const result = await limiter.limit(identifier);
    
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
      retryAfter: result.success ? undefined : Math.ceil((result.reset - Date.now()) / 1000),
    };
  } catch (error) {
    // If Redis fails, fail open (allow the request)
    console.error('[RateLimiter] Redis error:', error);
    const config = BOT_CONFIG.rateLimits[routeType];
    return {
      success: true,
      limit: config.requests,
      remaining: config.requests,
      reset: Date.now() + config.windowSeconds * 1000,
    };
  }
}

/**
 * Get rate limit info without consuming a request
 * Useful for adding to response headers
 */
export async function getRateLimitInfo(
  identifier: string,
  pathname: string
): Promise<{ remaining: number; limit: number } | null> {
  const routeType = classifyRoute(pathname);
  const limiter = getRateLimiter(routeType);
  
  if (!limiter) return null;

  try {
    // Use getRemaining if available, otherwise return null
    const result = await limiter.limit(identifier);
    return {
      remaining: result.remaining,
      limit: result.limit,
    };
  } catch {
    return null;
  }
}

/**
 * Check if an identifier is approaching the rate limit (80%+ used)
 * Used to add points to bot score
 */
export async function isApproachingLimit(
  identifier: string,
  pathname: string
): Promise<boolean> {
  const routeType = classifyRoute(pathname);
  const limiter = getRateLimiter(routeType);
  
  if (!limiter) return false;

  try {
    const result = await limiter.limit(identifier);
    const usagePercent = (result.limit - result.remaining) / result.limit;
    return usagePercent >= 0.8;
  } catch {
    return false;
  }
}
