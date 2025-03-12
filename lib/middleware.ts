import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define public routes that don't require authentication
const publicRoutes = [
  '/login', 
  '/signup', 
  '/forgot-password',
  '/api/auth'  // Add this to exclude NextAuth routes from middleware checks
]

export function middleware(request: NextRequest) {
  // Only apply to paths not starting with /api/auth
  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }
  
  const token = request.cookies.get('token')
  const isPublicRoute = publicRoutes.some(route => request.nextUrl.pathname.startsWith(route))

  // Redirect to login if accessing protected route without token
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect to dashboard if accessing auth pages with token
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
} 