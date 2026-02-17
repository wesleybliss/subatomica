import * as schema from '@repo/db/schema'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { APIError, createAuthMiddleware } from 'better-auth/api'
import { v7 as uuidv7 } from 'uuid'

import { db } from '@/db/client'
import { ensureUserHasTeam } from '@/services/teams'

const DEBUG_LOGGING = false

if (!process.env.BETTER_AUTH_URL)
    throw new Error('BETTER_AUTH_URL env var not set')

if (!process.env.BETTER_AUTH_TRUSTED_ORIGINS)
    throw new Error('BETTER_AUTH_TRUSTED_ORIGINS env var not set')

if (!process.env.INVITE_CODE?.length) throw new Error('INVITE_CODE env var not set')

const timestampFields = {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
}

type CreateAuthOptions = {
    provider?: 'sqlite' | 'pg' | 'mysql'
    secret?: string
    baseURL?: string
    trustedOrigins?: string[]
}

export const createAuth = (options: CreateAuthOptions = {}) => {
    
    const defaultOptions: CreateAuthOptions = {
        provider: process.env.DATABASE_DIALECT === 'turso' ? 'sqlite' : 'pg',
        secret: process.env.BETTER_AUTH_SECRET,
        baseURL: process.env.BETTER_AUTH_URL!.replace(/\/$/, ''),
        trustedOrigins: process.env.BETTER_AUTH_TRUSTED_ORIGINS!.split(','),
    }
    
    const config = {
        database: drizzleAdapter(db, {
            provider: options.provider || defaultOptions.provider!,
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
            maxPasswordLength: 128,
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
            before: createAuthMiddleware(async ctx => {
                if (ctx.path !== '/sign-up/email') return
                
                const inviteCode = ctx.body?.inviteCode
                
                console.log('raw body', ctx.body)
                console.log(inviteCode, '==?', process.env.INVITE_CODE, { res: inviteCode === process.env.INVITE_CODE })
                
                if (!inviteCode || inviteCode !== process.env.INVITE_CODE)
                    throw new APIError('BAD_REQUEST', {
                        message: 'Invalid invite code',
                    })
            }),
            after: createAuthMiddleware(async ctx => {
                
                // Ensure user has a team after signup or signin
                if ((ctx.path === '/sign-up/email' || ctx.path === '/sign-in/email') && ctx.context?.newSession?.user) {
                    
                                        const user = ctx.context.newSession.user;
                    console.log("Ensuring user has team after successful sign-in/up:", user.email);
                                        if (user.id)
                        try { await ensureUserHasTeam(user.id); console.log("ensureUserHasTeam success"); } catch (e) { console.error("ensureUserHasTeam failed", e); }
                }
                
            }),
        },
        secret: options.secret || defaultOptions.secret!,
        baseURL: options.baseURL || defaultOptions.baseURL!,
        basePath: '/auth',
        trustedOrigins: options.trustedOrigins || defaultOptions.trustedOrigins!,
        redirectURL: {
            signIn: '/dashboard',
            signUp: '/dashboard',
            signOut: '/',
        },
    }
    
    if (DEBUG_LOGGING)
        console.log('betterAuth config', config)
    
    return betterAuth(config)
    
}

export const auth = createAuth()

export default auth

export type Session = typeof auth.$Infer.Session
