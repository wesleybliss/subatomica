import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl
    
    // Protected routes that require authentication
    const protectedRoutes = ['/dashboard', '/t', '/p', '/settings']
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
    
    const sessionCookie = request.cookies.get('better-auth.session_token') ||
                          request.cookies.get('__Secure-better-auth.session_token')
    
    if (isProtectedRoute && !sessionCookie) {
        const url = new URL('/sign-in', request.url)
        return NextResponse.redirect(url)
    }
    
    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
