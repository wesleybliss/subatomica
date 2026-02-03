import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Protected routes that require authentication
    const protectedRoutes = ['/dashboard', '/p', '/settings', '/t']
    const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

    // Public routes that should redirect to dashboard if already authenticated
    const publicRoutes = ['/sign-in', '/sign-up']
    const _isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

    const sessionCookie = request.cookies.get('better-auth.session_token') ||
                          request.cookies.get('__Secure-better-auth.session_token')

    if (isProtectedRoute && !sessionCookie) {
        const url = new URL('/sign-in', request.url)
        return NextResponse.redirect(url)
    }

    // if (isPublicRoute && sessionCookie) {
    //     const url = new URL('/dashboard', request.url)
    //     return NextResponse.redirect(url)
    // }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
