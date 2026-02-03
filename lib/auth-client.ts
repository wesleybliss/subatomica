'use client'

import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
    // baseURL: process.env.NEXT_PUBLIC_APP_URL, // Removed to support Vercel Previews & avoid cross-origin cookie issues
})

export const { useSession, signIn, signOut, signUp } = authClient
