'use server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import type { User } from 'better-auth'

// Helper to get current user
export async function getCurrentUser(): Promise<User> {
    
    const session = await auth.api.getSession({
        headers: await headers(),
    })
    
    if (!session?.user?.id)
        throw new Error('Unauthorized')
    
    return session.user
    
}
