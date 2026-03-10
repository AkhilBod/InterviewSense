import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { NextRequestWithAuth } from 'next-auth/middleware'
import {
  detectBot,
  checkRateLimit,
  getClientIP,
  getRequestFingerprint,
  shouldSkipProtection,
  isBlockedPath,
  logBlockedRequest,
  protectionStats,
  BOT_CONFIG,
} from '@/lib/bot-protection'

// ============================================
// PUBLIC ROUTES (no auth required)
// ============================================
const publicRoutes = [
  '/',
  '/login',
  '/signup',
  '/verify-user',
  '/forgot-password',
  '/reset-password',
  '/contact',
  '/opportunities',
  '/companies',
  '/topics',
  '/difficulty',
  '/best',
  '/compare',
  '/api/auth/signup',
  '/api/auth/verify',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
]

// SEO routes that crawlers can access
const seoRoutes = [
  '/opportunities/',
  '/internship-opportunities',
  '/sitemap.xml',
  '/companies/',
  '/topics/',
  '/difficulty/',
  '/best/',
  '/compare/',
]

// ============================================
// MIDDLEWARE
// ============================================
export default async function middleware(request: NextRequestWithAuth) {
  const pathname = request.nextUrl.pathname
  const ip = getClientIP(request)

  // ----------------------------------------
  // 1. Hard-block known attack probe paths (WordPress scans, shell probes, etc.)
  // ----------------------------------------
  if (isBlockedPath(pathname)) {
    return new NextResponse(null, { status: 404 })
  }

  // ----------------------------------------
  // 2. Skip bot protection for static assets
  // ----------------------------------------
  if (shouldSkipProtection(pathname)) {
    return NextResponse.next()
  }

  // ----------------------------------------
  // 3. Check if IP is on allowlist
  // ----------------------------------------
  if (BOT_CONFIG.bypass.allowedIPs.includes(ip)) {
    return handleAuth(request, pathname)
  }

  // ----------------------------------------
  // 4. Bot Detection
  // ----------------------------------------
  const botResult = detectBot(request)

  // Allow verified search engine bots (Googlebot, Bingbot, etc.)
  if (botResult.isAllowedBot) {
    return handleAuth(request, pathname)
  }

  // Block known bad bots (AI scrapers, aggressive crawlers)
  if (botResult.isBlocked) {
    logBlockedRequest(request, 'bot_blocked', botResult)
    protectionStats.increment('blocked', botResult.botName)
    
    return new NextResponse(
      BOT_CONFIG.responses.includeBlockReason
        ? JSON.stringify({ error: 'Access denied', reason: botResult.reasons.join(', ') })
        : 'Access denied',
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  // ----------------------------------------
  // 4. Rate Limiting
  // ----------------------------------------
  const fingerprint = getRequestFingerprint(request)
  const rateLimitResult = await checkRateLimit(fingerprint, pathname)

  if (!rateLimitResult.success) {
    logBlockedRequest(request, 'rate_limited', botResult, rateLimitResult)
    protectionStats.increment('rate_limited')

    return new NextResponse(
      JSON.stringify({ error: 'Too many requests', retryAfter: rateLimitResult.retryAfter }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(rateLimitResult.retryAfter || BOT_CONFIG.responses.retryAfterSeconds),
          'X-RateLimit-Limit': String(rateLimitResult.limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(rateLimitResult.reset),
        },
      }
    )
  }

  // ----------------------------------------
  // 5. Challenge suspicious but not blocked requests
  // ----------------------------------------
  if (botResult.isChallenge) {
    logBlockedRequest(request, 'bot_challenged', botResult)
    protectionStats.increment('challenged')
    
    // For now, we log but allow through
    // In the future, you could:
    // - Return a CAPTCHA page
    // - Add a JavaScript challenge
    // - Slow down the response
  }

  // ----------------------------------------
  // 6. Add rate limit headers to response
  // ----------------------------------------
  const response = await handleAuth(request, pathname)
  
  // Add rate limit headers for transparency
  response.headers.set('X-RateLimit-Limit', String(rateLimitResult.limit))
  response.headers.set('X-RateLimit-Remaining', String(rateLimitResult.remaining))
  response.headers.set('X-RateLimit-Reset', String(rateLimitResult.reset))

  return response
}

// ============================================
// AUTH HANDLING (original logic)
// ============================================
async function handleAuth(
  request: NextRequestWithAuth,
  pathname: string
): Promise<NextResponse> {
  // Always allow homepage
  if (pathname === '/') {
    return NextResponse.next()
  }

  // Allow SEO routes
  if (seoRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Check if it's a public route
  const isPublicRoute = publicRoutes.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  )

  if (isPublicRoute) {
    return NextResponse.next()
  }

  // For protected routes, check authentication
  const token = await getToken({ req: request })

  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

// ============================================
// MATCHER CONFIG
// ============================================
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon files
     * - public folder assets
     * - API auth routes (handled by NextAuth)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|favicon\\.svg|logo\\.webp|og-image\\.png|manifest\\.json|api/auth|robots\\.txt|sitemap\\.xml|articles-sitemap\\.xml|sitemap-internships\\.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|eot|ttf|otf)).*)',
  ],
} 