import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { APIError, createAuthMiddleware } from 'better-auth/api'
import { v7 as uuidv7 } from 'uuid'
import { ensureUserHasTeam } from '@/lib/db/actions'
import { db } from '@/lib/db/client'
import * as schema from '@/lib/db/schema'

if (!process.env.BETTER_AUTH_URL)
    throw new Error('BETTER_AUTH_URL env var not set')

if (!process.env.BETTER_AUTH_TRUSTED_ORIGINS)
    throw new Error('BETTER_AUTH_TRUSTED_ORIGINS env var not set')

if (!process.env.INVITE_CODE?.length) throw new Error('INVITE_CODE env var not set')

const timestampFields = {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
}

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: process.env.DATABASE_DIALECT === 'turso' ? 'sqlite' : 'pg',
        schema,
    }),
    advanced: {
        database: {
            generateId: () => uuidv7(),
        },
    },
    emailAndPassword: {
        enabled: true,
        minPasswordLength: 8,
        maxPasswordLength: 32,
    },
    user: {
        modelName: 'users',
        fields: timestampFields,
    },
    session: {
        modelName: 'sessions',
        fields: timestampFields,
    },
    account: {
        modelName: 'accounts',
        fields: timestampFields,
    },
    verification: {
        modelName: 'verifications',
        fields: timestampFields,
    },
    hooks: {
        before: createAuthMiddleware(async (ctx) => {
            if (ctx.path !== '/sign-up/email') return

            const inviteCode = ctx.body?.inviteCode

            console.log('raw body', ctx.body)
            console.log(inviteCode, '==?', process.env.INVITE_CODE, { res: inviteCode === process.env.INVITE_CODE })

            if (!inviteCode || inviteCode !== process.env.INVITE_CODE)
                throw new APIError('BAD_REQUEST', {
                    message: 'Invalid invite code',
                })
        }),
        after: createAuthMiddleware(async (ctx) => {
            
            // Ensure user has a workspace after signup or signin
            if (ctx.path === '/sign-up/email' || ctx.path === '/sign-in/email') {
                const user = ctx.context?.newSession?.user
                console.log('Ensure user has a workspace after signup or signin', user, ctx)
                if (user?.id)
                    await ensureUserHasTeam(user.id)
            }
        }),
    },
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL.replace(/\/$/, ''),
    trustedOrigins: process.env.BETTER_AUTH_TRUSTED_ORIGINS.split(','),
})

export type Session = typeof auth.$Infer.Session
