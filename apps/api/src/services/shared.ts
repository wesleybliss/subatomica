import type { User } from 'better-auth'
import { eq, inArray, or } from 'drizzle-orm'
import { Context } from 'hono'

import { db } from '@/db/client'
import { teamMembers, teams } from '@/db/schema'
import auth from '@/services/auth'

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

/**
 * Gets IDs of teams accessible to the user
 */
export const getAccessibleTeamIds = (userId: string) => {
    const memberTeamIds = db
        .select({ id: teamMembers.teamId })
        .from(teamMembers)
        .where(eq(teamMembers.userId, userId))
    
    return db
        .select({ id: teams.id })
        .from(teams)
        .where(or(
            eq(teams.ownerId, userId),
            inArray(teams.id, memberTeamIds),
        ))
}
