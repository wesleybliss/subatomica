import { accounts, users } from '@repo/db/schema'
import Logger from '@repo/shared/utils/logger'
import { hashPassword } from 'better-auth/crypto'
import { and, eq } from 'drizzle-orm'

import { db } from '@/db/client'

const log = new Logger('api/services/claim')

export type ClaimAccountInput = {
    email: string
    password: string
    name?: string
    inviteCode: string
}

export async function claimPlaceholderAccount(input: ClaimAccountInput) {
    if (!input.inviteCode || input.inviteCode !== process.env.INVITE_CODE)
        throw new Error('BadRequest: Invalid invite code')
    
    if (!input.password || input.password.length < 8)
        throw new Error('BadRequest: Password must be at least 8 characters')
    
    const email = input.email.trim().toLowerCase()
    if (!email || !email.includes('@'))
        throw new Error('BadRequest: Invalid email')
    
    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1)
    
    if (!user)
        throw new Error('NotFound: No account found for this email')
    
    const [cred] = await db
        .select({ id: accounts.id })
        .from(accounts)
        .where(and(
            eq(accounts.userId, user.id),
            eq(accounts.providerId, 'credential'),
        ))
        .limit(1)
    
    if (cred)
        throw new Error('Conflict: Account already claimed — sign in instead')
    
    const hashed = await hashPassword(input.password)
    
    await db.insert(accounts).values({
        accountId: user.id,
        providerId: 'credential',
        userId: user.id,
        password: hashed,
    })
    
    const nextName = input.name?.trim()
    if (nextName && nextName !== user.name) {
        await db
            .update(users)
            .set({
                name: nextName,
                updatedAt: new Date().toISOString(),
            })
            .where(eq(users.id, user.id))
    }
    
    log.i('Claimed placeholder account', email)
    
    return {
        ok: true as const,
        email: user.email,
        userId: user.id,
    }
}
