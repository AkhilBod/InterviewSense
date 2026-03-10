/**
 * Redis Cache Utility
 *
 * Thin wrapper around Upstash Redis for caching API responses.
 * Gracefully falls back to no-cache when Redis isn't configured.
 *
 * Usage:
 *   const data = await cache.get<MyType>('key')
 *   if (data) return data           // cache hit
 *   const fresh = await fetchFromDB()
 *   await cache.set('key', fresh, 60) // cache for 60s
 *   return fresh
 */

import { Redis } from '@upstash/redis'

// ── Singleton Redis client ──────────────────────────────────
let redis: Redis | null = null

function getRedis(): Redis | null {
  if (redis) return redis

  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) return null

  redis = new Redis({ url, token })
  return redis
}

// ── Public API ──────────────────────────────────────────────

/**
 * Get a cached value. Returns `null` on miss or if Redis is unavailable.
 */
async function get<T = unknown>(key: string): Promise<T | null> {
  try {
    const r = getRedis()
    if (!r) return null

    const raw = await r.get<T>(key)
    return raw ?? null
  } catch (err) {
    console.error('[Cache] GET error:', err)
    return null // fail open — app keeps working
  }
}

/**
 * Set a cached value with a TTL in seconds.
 */
async function set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  try {
    const r = getRedis()
    if (!r) return

    await r.set(key, value, { ex: ttlSeconds })
  } catch (err) {
    console.error('[Cache] SET error:', err)
    // fail silently — next request will just hit the DB
  }
}

/**
 * Delete one or more cache keys (e.g. after a mutation).
 */
async function del(...keys: string[]): Promise<void> {
  try {
    const r = getRedis()
    if (!r || keys.length === 0) return

    await r.del(...keys)
  } catch (err) {
    console.error('[Cache] DEL error:', err)
  }
}

/**
 * Delete all keys matching a prefix (e.g. `cache:user:abc123:*`).
 * Uses SCAN so it's safe even with many keys.
 */
async function invalidatePrefix(prefix: string): Promise<void> {
  try {
    const r = getRedis()
    if (!r) return

    let cursor = 0
    do {
      const [nextCursor, keys] = await r.scan(cursor, { match: `${prefix}*`, count: 100 })
      cursor = Number(nextCursor)
      if (keys.length > 0) {
        await r.del(...keys)
      }
    } while (cursor !== 0)
  } catch (err) {
    console.error('[Cache] INVALIDATE_PREFIX error:', err)
  }
}

// ── Key builders (consistent naming) ────────────────────────

export const cacheKeys = {
  onboardingStatus: (userId: string) => `cache:onboarding:${userId}`,
  userStats: (userId: string) => `cache:stats:${userId}`,
  heatmap: (userId: string) => `cache:heatmap:${userId}`,
  userAll: (userId: string) => `cache:*:${userId}*`, // not a real key — use with invalidatePrefix
}

// ── Export ───────────────────────────────────────────────────

export const cache = { get, set, del, invalidatePrefix }
