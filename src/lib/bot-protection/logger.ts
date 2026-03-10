/**
 * Bot Protection Logger
 * 
 * Production-safe logging for blocked/challenged requests.
 * Easy to swap to an analytics provider later.
 */

import { NextRequest } from 'next/server';
import { BotDetectionResult } from './detect';
import { RateLimitResult } from './rate-limit';
import { getClientIP } from './detect';

export interface BlockedRequestLog {
  timestamp: string;
  ip: string;
  pathname: string;
  userAgent: string;
  reason: 'bot_blocked' | 'rate_limited' | 'bot_challenged';
  details: {
    score?: number;
    reasons?: string[];
    botName?: string;
    rateLimitRemaining?: number;
  };
}

/**
 * Log a blocked or challenged request
 * 
 * In production, you can replace console.log with:
 * - Vercel Analytics
 * - Datadog
 * - PostHog
 * - A custom webhook
 */
export function logBlockedRequest(
  request: NextRequest,
  reason: BlockedRequestLog['reason'],
  botResult?: BotDetectionResult,
  rateLimitResult?: RateLimitResult
): void {
  const log: BlockedRequestLog = {
    timestamp: new Date().toISOString(),
    ip: getClientIP(request),
    pathname: request.nextUrl.pathname,
    userAgent: request.headers.get('user-agent') || 'none',
    reason,
    details: {},
  };

  if (botResult) {
    log.details.score = botResult.score;
    log.details.reasons = botResult.reasons;
    log.details.botName = botResult.botName;
  }

  if (rateLimitResult) {
    log.details.rateLimitRemaining = rateLimitResult.remaining;
  }

  // Structured logging for easy parsing
  if (process.env.NODE_ENV === 'production') {
    // JSON format for log aggregators
    console.log(JSON.stringify({
      type: 'bot_protection',
      ...log,
    }));
  } else {
    // Human-readable in development
    console.log(`[BotProtection] ${reason}:`, {
      ip: log.ip,
      path: log.pathname,
      ua: log.userAgent.slice(0, 80),
      ...log.details,
    });
  }
}

/**
 * Log stats periodically (optional)
 * Call this from a cron job if you want aggregated stats
 */
export function logProtectionStats(stats: {
  totalBlocked: number;
  totalChallenged: number;
  totalRateLimited: number;
  topBlockedBots: Record<string, number>;
  topBlockedIPs: Record<string, number>;
}): void {
  console.log(JSON.stringify({
    type: 'bot_protection_stats',
    timestamp: new Date().toISOString(),
    ...stats,
  }));
}

/**
 * Simple in-memory stats (resets on cold start)
 * For production, store in Redis or a database
 */
class ProtectionStatsCollector {
  private blocked = 0;
  private challenged = 0;
  private rateLimited = 0;
  private botCounts: Map<string, number> = new Map();

  increment(type: 'blocked' | 'challenged' | 'rate_limited', botName?: string): void {
    switch (type) {
      case 'blocked':
        this.blocked++;
        break;
      case 'challenged':
        this.challenged++;
        break;
      case 'rate_limited':
        this.rateLimited++;
        break;
    }

    if (botName) {
      this.botCounts.set(botName, (this.botCounts.get(botName) || 0) + 1);
    }
  }

  getStats() {
    return {
      totalBlocked: this.blocked,
      totalChallenged: this.challenged,
      totalRateLimited: this.rateLimited,
      topBlockedBots: Object.fromEntries(
        Array.from(this.botCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
      ),
    };
  }
}

export const protectionStats = new ProtectionStatsCollector();
