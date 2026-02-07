import { createAuthClient } from 'better-auth/react'

if (!import.meta.env.VITE_BETTER_AUTH_URL)
    throw new Error('VITE_BETTER_AUTH_URL is not defined')

console.log('lib/auth-client: baseURL:', import.meta.env.VITE_BETTER_AUTH_URL)

export const authClient = createAuthClient({
    baseURL: import.meta.env.VITE_BETTER_AUTH_URL,
    
    // Don't automatically add /api/auth to the basePath
    basePath: '/auth',
})

export const { useSession, signIn, signOut, signUp } = authClient
