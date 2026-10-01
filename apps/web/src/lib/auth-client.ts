import { createAuthClient } from 'better-auth/react'

import { API_BASE } from '@/lib/api-base'

const baseURL = API_BASE || (typeof window !== 'undefined' ? window.location.origin : undefined)

console.log('lib/auth-client: baseURL:', baseURL || '(unresolved)')

export const authClient = createAuthClient({
    // Same-origin when API_BASE is empty (Vite proxies /auth → API)
    ...(baseURL ? { baseURL } : {}),
    basePath: '/auth',
})

export const { useSession, signIn, signOut, signUp } = authClient
