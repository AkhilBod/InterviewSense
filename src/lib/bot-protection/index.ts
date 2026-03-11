/**
 * Bot Protection - Main Export
 * 
 * Import everything from this file for convenience.
 */

export { BOT_CONFIG, classifyRoute, shouldSkipProtection, isBlockedPath, isBlockedIPRange } from './config';
export { detectBot, isAllowedBot, isBlockedBot, getClientIP, getRequestFingerprint } from './detect';
export type { BotDetectionResult } from './detect';
export { checkRateLimit, getRateLimitInfo, isApproachingLimit } from './rate-limit';
export type { RateLimitResult } from './rate-limit';
export { logBlockedRequest, protectionStats } from './logger';
export type { BlockedRequestLog } from './logger';
