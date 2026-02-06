import { auth } from 'src/services/auth'
import type { User } from 'better-auth'

// Helper to get current user
export const getCurrentUser = async (request: FastifyRequest): Promise<User> => {
    
    const session = await auth.api.getSession({
        headers: request.headers,
    })
    
    if (!session?.user?.id)
        throw new Error('Unauthorized')
    
    return session.user
    
}
