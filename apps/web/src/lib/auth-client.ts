import Logger from '@repo/shared/utils/logger'
import { createAuthClient } from 'better-auth/react'

import { API_BASE } from '@/lib/api-base'

const log = new Logger('web/lib/auth-client')

const baseURL = API_BASE || (typeof window !== 'undefined' ? window.location.origin : undefined)

log.d('lib/auth-client: baseURL:', baseURL || '(unresolved)')

export const authClient = createAuthClient({
    // Same-origin when API_BASE is empty (Vite proxies /auth → API)
    ...(baseURL ? { baseURL } : {}),
    basePath: '/auth',
})

export const { useSession, signIn, signOut, signUp } = authClient
