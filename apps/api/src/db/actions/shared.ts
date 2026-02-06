'use server'
import { auth } from '@/services/auth'
import type { User } from 'better-auth'
import { Context } from 'hono'

// Helper to get current user
export async function getCurrentUser(c: Context): Promise<User> {
    
    const session = await auth.api.getSession({
        headers: c.req.raw.headers
    })
    
    if (!session?.user?.id)
        throw new Error('Unauthorized')
    
    return session.user
    
}
