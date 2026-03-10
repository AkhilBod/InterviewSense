/**
 * Bot Detection Utilities
 * 
 * Scoring system to identify suspicious requests without blocking legitimate users.
 * Higher score = more likely to be a bot.
 */

import { NextRequest } from 'next/server';
import { BOT_CONFIG, classifyRoute } from './config';

export interface BotDetectionResult {
  isBot: boolean;
  isBlocked: boolean;
  isChallenge: boolean;
  isAllowedBot: boolean;
  score: number;
  reasons: string[];
  botName?: string;
}

/**
 * Analyze a request and return bot detection results
 */
export function detectBot(request: NextRequest): BotDetectionResult {
  const ua = request.headers.get('user-agent') || '';
  const pathname = request.nextUrl.pathname;
  
  const result: BotDetectionResult = {
    isBot: false,
    isBlocked: false,
    isChallenge: false,
    isAllowedBot: false,
    score: 0,
    reasons: [],
  };

  // Check for allowed bots first (search engines, social media)
  const allowedBot = BOT_CONFIG.allowedBots.find(bot => bot.pattern.test(ua));
  if (allowedBot) {
    result.isBot = true;
    result.isAllowedBot = true;
    result.botName = allowedBot.name;
    return result;
  }

  // Check for explicitly blocked bots
  const blockedBot = BOT_CONFIG.blockedBots.find(bot => bot.pattern.test(ua));
  if (blockedBot) {
    result.isBot = true;
    result.isBlocked = true;
    result.botName = blockedBot.name;
    result.score = 100;
    result.reasons.push(`blocked_bot:${blockedBot.name}`);
    return result;
  }

  // Score-based detection for everything else
  const { points } = BOT_CONFIG.scoring;

  // 1. Check user-agent issues
  if (!ua || ua.length < 10) {
    result.score += points.noUserAgent;
    result.reasons.push('no_user_agent');
  } else {
    // Check for automation signatures
    const automationMatch = BOT_CONFIG.automationSignatures.find(sig => sig.test(ua));
    if (automationMatch) {
      result.score += points.automationSignature;
      result.reasons.push('automation_signature');
    }

    // Suspicious UA patterns (too short, generic, or weird)
    if (ua.length < 50 && !ua.includes('Mozilla')) {
      result.score += points.suspiciousUserAgent;
      result.reasons.push('suspicious_user_agent');
    }
  }

  // 2. Check for missing standard browser headers
  const accept = request.headers.get('accept');
  const acceptLanguage = request.headers.get('accept-language');
  const acceptEncoding = request.headers.get('accept-encoding');
  const secFetchMode = request.headers.get('sec-fetch-mode');
  const secFetchSite = request.headers.get('sec-fetch-site');

  if (!accept || accept === '*/*') {
    result.score += points.missingAcceptHeader;
    result.reasons.push('missing_accept');
  }

  if (!acceptLanguage) {
    result.score += points.missingAcceptLanguage;
    result.reasons.push('missing_accept_language');
  }

  if (!acceptEncoding) {
    result.score += points.missingAcceptEncoding;
    result.reasons.push('missing_accept_encoding');
  }

  // Modern browsers send sec-fetch-* headers
  if (!secFetchMode && !secFetchSite && ua.includes('Chrome/')) {
    result.score += points.missingSecFetchHeaders;
    result.reasons.push('missing_sec_fetch');
  }

  // 3. Check for sensitive route access
  const isSensitive = BOT_CONFIG.routes.sensitive.some(r => pathname.startsWith(r));
  if (isSensitive) {
    result.score += points.sensitiveRouteAccess;
    result.reasons.push('sensitive_route');
  }

  // 4. Check referrer (optional, some legitimate users block this)
  const referer = request.headers.get('referer');
  if (referer) {
    // Suspicious if referrer is from a different domain hitting API routes
    if (pathname.startsWith('/api/') && !referer.includes('interviewsense.org') && !referer.includes('localhost')) {
      result.score += points.unusualReferrer;
      result.reasons.push('external_api_access');
    }
  }

  // Determine final status
  result.isBot = result.score >= BOT_CONFIG.scoring.challengeThreshold;
  result.isChallenge = result.score >= BOT_CONFIG.scoring.challengeThreshold && result.score < BOT_CONFIG.scoring.blockThreshold;
  result.isBlocked = result.score >= BOT_CONFIG.scoring.blockThreshold;

  return result;
}

/**
 * Quick check if a request is from a known good bot
 */
export function isAllowedBot(userAgent: string): boolean {
  return BOT_CONFIG.allowedBots.some(bot => bot.pattern.test(userAgent));
}

/**
 * Quick check if a request is from a known bad bot
 */
export function isBlockedBot(userAgent: string): boolean {
  return BOT_CONFIG.blockedBots.some(bot => bot.pattern.test(userAgent));
}

/**
 * Get client IP from request, handling Vercel's forwarding headers
 */
export function getClientIP(request: NextRequest): string {
  // Vercel provides the real IP in x-forwarded-for or x-real-ip
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    // x-forwarded-for can be comma-separated list, first is the client
    return forwarded.split(',')[0].trim();
  }
  
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Fallback - shouldn't happen on Vercel
  return 'unknown';
}

/**
 * Generate a fingerprint for rate limiting
 * Uses IP + partial UA hash to group similar requests
 */
export function getRequestFingerprint(request: NextRequest): string {
  const ip = getClientIP(request);
  const ua = request.headers.get('user-agent') || '';
  
  // Simple hash of first 50 chars of UA
  const uaHash = ua.slice(0, 50).split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0).toString(16);

  return `${ip}:${uaHash}`;
}
