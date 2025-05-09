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
  '/api/auth/signup',
  '/api/auth/verify',
  '/api/auth/forgot-password',
  '/api/auth/reset-password'
]

export default async function middleware(request: NextRequestWithAuth) {
  const token = await getToken({ req: request })
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  // Allow public routes and API routes that don't require auth
  if (isPublicRoute) {
    return NextResponse.next()
  }

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
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
} 