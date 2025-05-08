import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const isAuthenticated = !!token

  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Define protected routes
  const protectedRoutes = ['/start', '/interview']

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))

  // If the route is protected and user is not authenticated, redirect to login
  if (isProtectedRoute && !isAuthenticated) {
    const url = new URL('/login', request.url)
    url.searchParams.set('callbackUrl', path)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    '/start/:path*',
    '/interview/:path*'
  ]
} 