import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { NextRequestWithAuth } from 'next-auth/middleware'

// List of public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/signup',
  '/verify-user',
  '/forgot-password',
  '/reset-password',
  '/contact',
  '/opportunities',
  '/api/auth/signup',
  '/api/auth/verify',
  '/api/auth/forgot-password',
  '/api/auth/reset-password'
]

// SEO and opportunity routes that should be crawlable
const seoRoutes = [
  '/opportunities/',
  '/internship-opportunities',
  '/sitemap.xml'
]

export default async function middleware(request: NextRequestWithAuth) {
  const pathname = request.nextUrl.pathname

  // Always allow access to the homepage for SEO crawlers
  if (pathname === '/') {
    return NextResponse.next()
  }

  // Allow all SEO and opportunity routes
  if (seoRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Check if it's a public route
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route)
  )

  // Allow public routes and API routes that don't require auth
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // For protected routes, check authentication
  const token = await getToken({ req: request })

  // Redirect to login if not authenticated
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, favicon.svg (favicon files)
     * - logo.webp, og-image.png (static images)
     * - manifest.json (PWA manifest)
     * - public folder assets
     * - API auth routes (handled by NextAuth)
     * - Static assets
     */
    '/((?!_next/static|_next/image|favicon\\.ico|favicon\\.svg|logo\\.webp|og-image\\.png|manifest\\.json|api/auth|robots\\.txt|sitemap\\.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|eot|ttf|otf)).*)',
  ],
} 