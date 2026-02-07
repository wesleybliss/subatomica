import { Context } from 'hono'
import auth from '@/services/auth'
import type { User } from 'better-auth'

export const getCurrentSession = async (c: Context) => {
    
    const session = await auth.api.getSession({
        headers: c.req.raw.headers,
    })
    
    if (!session)
        throw new Error('Unauthorized')
    
    return session
    
}

export const getCurrentUser = async (c: Context): Promise<User> => {
    
    const session = await getCurrentSession(c)
    
    if (!session || !session.user)
        throw new Error('Unauthorized')
    
    return session.user
    
}
