/**
 * Bot Protection Configuration
 * 
 * Centralized config for all bot detection, rate limiting, and filtering.
 * Tune these values based on your traffic patterns.
 */

export const BOT_CONFIG = {
  // ============================================
  // VERIFIED SEARCH ENGINE CRAWLERS (ALWAYS ALLOW)
  // ============================================
  // These bots are verified by reverse DNS lookup patterns
  allowedBots: [
    { name: 'Googlebot', pattern: /googlebot/i, dnsSuffix: '.googlebot.com' },
    { name: 'Bingbot', pattern: /bingbot/i, dnsSuffix: '.search.msn.com' },
    { name: 'DuckDuckBot', pattern: /duckduckbot/i, dnsSuffix: '.duckduckgo.com' },
    { name: 'Yandex', pattern: /yandex/i, dnsSuffix: '.yandex.com' },
    { name: 'Baiduspider', pattern: /baiduspider/i, dnsSuffix: '.baidu.com' },
    { name: 'Slurp', pattern: /slurp/i, dnsSuffix: '.yahoo.net' }, // Yahoo
    { name: 'LinkedInBot', pattern: /linkedinbot/i },
    { name: 'Twitterbot', pattern: /twitterbot/i },
    { name: 'facebookexternalhit', pattern: /facebookexternalhit/i },
    { name: 'WhatsApp', pattern: /whatsapp/i },
    { name: 'Slackbot', pattern: /slackbot/i },
    { name: 'TelegramBot', pattern: /telegrambot/i },
    { name: 'Discordbot', pattern: /discordbot/i },
    // Google services
    { name: 'Google-PrefetchProxy', pattern: /chrome privacy preserving prefetch proxy/i },
    { name: 'Googlebot-Image', pattern: /googlebot-image/i },
    { name: 'Googlebot-Video', pattern: /googlebot-video/i },
    { name: 'Google-InspectionTool', pattern: /google-inspectiontool/i },
    { name: 'GoogleOther', pattern: /googleother/i },
    { name: 'Storebot-Google', pattern: /storebot-google/i },
  ],

  // ============================================
  // BLOCKED BOTS (AI SCRAPERS, KNOWN BAD ACTORS)
  // ============================================
  blockedBots: [
    // AI/LLM Scrapers
    { name: 'GPTBot', pattern: /gptbot/i },
    { name: 'ChatGPT-User', pattern: /chatgpt-user/i },
    { name: 'CCBot', pattern: /ccbot/i },
    { name: 'ClaudeBot', pattern: /claude-web|claudebot|anthropic/i },
    { name: 'PerplexityBot', pattern: /perplexitybot/i },
    { name: 'Bytespider', pattern: /bytespider/i }, // TikTok/ByteDance
    { name: 'Amazonbot', pattern: /amazonbot/i },
    { name: 'Meta-ExternalAgent', pattern: /meta-externalagent/i },
    { name: 'Cohere-ai', pattern: /cohere-ai/i },
    { name: 'YouBot', pattern: /youbot/i },
    // Known aggressive scrapers
    { name: 'SemrushBot', pattern: /semrushbot/i },
    { name: 'AhrefsBot', pattern: /ahrefsbot/i },
    { name: 'MJ12bot', pattern: /mj12bot/i },
    { name: 'DotBot', pattern: /dotbot/i },
    { name: 'PetalBot', pattern: /petalbot/i },
    { name: 'DataForSeoBot', pattern: /dataforseobot/i },
    { name: 'BLEXBot', pattern: /blexbot/i },
    { name: 'ZoominfoBot', pattern: /zoominfobot/i },
  ],

  // ============================================
  // HEADLESS BROWSER / AUTOMATION DETECTION
  // ============================================
  automationSignatures: [
    /headless/i,
    /phantomjs/i,
    /selenium/i,
    /puppeteer/i,
    /playwright/i,
    /webdriver/i,
    /chrome-lighthouse/i,
    /electron/i,
    /httrack/i,
    /wget/i,
    /curl/i,  // Only suspicious when combined with other signals
    /python-requests/i,
    /python-urllib/i,
    /go-http-client/i,
    /java\//i,
    /libwww/i,
    /scrapy/i,
    /node-fetch/i,
    /axios/i,
  ],

  // ============================================
  // RATE LIMITS (requests per window)
  // ============================================
  rateLimits: {
    // General pages - generous limit for normal browsing
    general: {
      requests: 100,
      windowSeconds: 60,
    },
    // Opportunities pages - most targeted by scrapers
    opportunities: {
      requests: 40,
      windowSeconds: 60,
    },
    // API routes - stricter
    api: {
      requests: 30,
      windowSeconds: 60,
    },
    // Auth routes - very strict to prevent brute force
    auth: {
      requests: 10,
      windowSeconds: 60,
    },
    // Search/filter endpoints - expensive operations
    search: {
      requests: 20,
      windowSeconds: 60,
    },
    // Dashboard/protected areas
    protected: {
      requests: 60,
      windowSeconds: 60,
    },
  },

  // ============================================
  // BOT SCORING THRESHOLDS
  // ============================================
  scoring: {
    // Points added for each suspicious signal
    points: {
      noUserAgent: 30,
      suspiciousUserAgent: 20,
      automationSignature: 40,
      missingAcceptHeader: 10,
      missingAcceptLanguage: 8,
      missingAcceptEncoding: 5,
      missingSecFetchHeaders: 8,  // Modern browsers send these
      tooManyRequests: 15,        // Added when rate limit is 80%+ used
      sensitiveRouteAccess: 5,
      sequentialPathPattern: 10,  // Hitting /page/1, /page/2, /page/3...
      unusualReferrer: 8,
    },
    // Block if score exceeds this
    blockThreshold: 50,
    // Challenge (soft block) if score exceeds this
    challengeThreshold: 30,
  },

  // ============================================
  // ROUTE CLASSIFICATIONS
  // ============================================
  routes: {
    // Routes that are high-value targets for scrapers
    sensitive: [
      '/opportunities',
      '/api/opportunities',
      '/api/search',
      '/api/filter',
      '/internship-opportunities',
    ],
    // Auth routes needing strict limits
    auth: [
      '/api/auth',
      '/login',
      '/signup',
      '/forgot-password',
      '/reset-password',
    ],
    // Protected routes requiring authentication
    protected: [
      '/dashboard',
      '/interview',
      '/technical-assessment',
      '/resume-checker',
      '/system-design',
      '/career-roadmap',
      '/portfolio-review',
      '/cover-letter',
      '/profile',
    ],
    // API routes
    api: [
      '/api/',
    ],
  },

  // ============================================
  // BYPASS RULES
  // ============================================
  bypass: {
    // IPs that always bypass bot protection (e.g., your office, monitoring)
    allowedIPs: [] as string[],
    // Paths that skip bot detection entirely
    skipPaths: [
      '/_next/',
      '/favicon',
      '/manifest.json',
      '/robots.txt',
      '/sitemap',
      '/sw.js',
    ],
    // Paths that always return 404 immediately (attack probes, CMS scans)
    blockedPaths: [
      '/wp-admin',
      '/wp-login',
      '/wp-content',
      '/wp-includes',
      '/xmlrpc.php',
      '/administrator',
      '/admin.php',
      '/phpmyadmin',
      '/.env',
      '/.git',
      '/config.php',
      '/shell.php',
      '/eval-stdin.php',
      '/vendor/phpunit',
    ],
  },

  // ============================================
  // RESPONSE SETTINGS
  // ============================================
  responses: {
    // Retry-After header value in seconds for 429 responses
    retryAfterSeconds: 60,
    // Whether to include reason in response (disable in prod for security)
    includeBlockReason: process.env.NODE_ENV === 'development',
  },
} as const;

// Route classification helper
export function classifyRoute(pathname: string): 'auth' | 'api' | 'protected' | 'opportunities' | 'search' | 'general' {
  const { routes } = BOT_CONFIG;
  
  if (routes.auth.some(r => pathname.startsWith(r))) return 'auth';
  if (pathname.includes('/search') || pathname.includes('/filter')) return 'search';
  if (pathname.startsWith('/opportunities') || pathname.startsWith('/internship')) return 'opportunities';
  if (routes.protected.some(r => pathname.startsWith(r))) return 'protected';
  if (routes.api.some(r => pathname.startsWith(r))) return 'api';
  
  return 'general';
}

// Check if path should skip bot protection
export function shouldSkipProtection(pathname: string): boolean {
  return BOT_CONFIG.bypass.skipPaths.some(p => pathname.startsWith(p));
}

// Check if path is a known attack probe that should be hard-blocked with 404
export function isBlockedPath(pathname: string): boolean {
  return BOT_CONFIG.bypass.blockedPaths.some(p => pathname.startsWith(p) || pathname.toLowerCase().includes(p.replace('/', '')));
}
