import 'dotenv/config'

import { swaggerUI } from '@hono/swagger-ui'
import { OpenAPIHono } from '@hono/zod-openapi'
import Logger from '@repo/shared/utils/logger'
import { Context } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'

import { ApiAppEnv, createApp } from '@/env'

const log = new Logger('api/app')
import healthRoutes from '@/routes/health'
import lanesRoutes from '@/routes/lanes'
import projectsRoutes from '@/routes/projects'
import tasksRoutes from '@/routes/tasks'
import teamsRoutes from '@/routes/teams'
import { trelloProtectedRoutes, trelloPublicRoutes } from '@/routes/trello'
import { auth as defaultAuth } from '@/services/auth' // BetterAuth instance
import { claimPlaceholderAccount } from '@/services/claim'

import pkg from '../../../package.json' assert { type: 'json' }
// import { env } from './env'

type Package = {
    version: string
}

export const createApiServer = (auth = defaultAuth) => {
    
    const app = createApp()
    
    // Global middleware
    app.use('*', cors({
        origin: process.env.BETTER_AUTH_TRUSTED_ORIGINS!.split(','),
        credentials: true, // optional: if you need cookies/auth
        allowHeaders: ['Content-Type', 'Authorization'],
        allowMethods: ['POST', 'GET', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        exposeHeaders: ['Content-Length'],
        maxAge: 600,
    }))
    app.use('*', logger())
    app.use('*', prettyJSON())
    
    const openApiConfig = {
        openapi: '3.1.0',
        info: {
            title: 'Sub-Atomica API',
            version: (pkg as Package).version,
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    } as Parameters<typeof app.doc>[1]
    
    app.doc('/openapi.json', openApiConfig)
    
    app.get('/docs', swaggerUI({ url: '/openapi.json' }))
    app.get('/doc', c => c.redirect('/openapi.json'))
    app.get('/ui', c => c.redirect('/docs'))
    
    const api = app
        .get('/', c => c.json({
            version: (pkg as Package).version,
        }))
        .get('/health', c => c.json({
            ok: true,
        }))
    
    // Bind session to context
    api.use('*', async (c, next) => {
        
        const session = await auth.api.getSession({ headers: c.req.raw.headers })
        
        if (!session) {
            
            c.set('user', null)
            c.set('session', null)
            
            await next()
            
            return
        }
        
        c.set('user', session.user)
        c.set('session', session.session)
        
        await next()
        
    })
    
    // Handle all auth routes under /auth/*
    api.on(['GET', 'POST'], '/auth/*', async c => {
        return auth.handler(c.req.raw)
    })
    
    const finalApi = api.get('/session', c => {
        
        const session = c.get('session')
        const user = c.get('user')
        
        if (!user) return c.body(null, 401)
        
        return c.json({
            session,
            user,
        })
        
    })
    
    // Claim a Trello-imported placeholder user (no session yet)
    finalApi.post('/claim-account', async c => {
        try {
            const body = await c.req.json() as {
                email?: string
                password?: string
                name?: string
                inviteCode?: string
            }
            const result = await claimPlaceholderAccount({
                email: body.email || '',
                password: body.password || '',
                name: body.name,
                inviteCode: body.inviteCode || '',
            })
            return c.json(result, 200)
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Claim failed'
            if (message.startsWith('BadRequest:'))
                return c.json({ error: message.replace(/^BadRequest:\s*/, '') }, 400)
            if (message.startsWith('NotFound:'))
                return c.json({ error: message.replace(/^NotFound:\s*/, '') }, 404)
            if (message.startsWith('Conflict:'))
                return c.json({ error: message.replace(/^Conflict:\s*/, '') }, 409)
            log.e('claim-account failed', err)
            return c.json({ error: 'Claim failed' }, 500)
        }
    })
    
    // Trello OAuth callback + webhooks (no session required)
    finalApi.route('/integrations/trello', trelloPublicRoutes)
    
    const protectedRoutes = new OpenAPIHono<ApiAppEnv>().use('*', async (c, next) => {
        const user = c.get('user')
        if (!user) {
            return c.json({ error: 'Unauthorized' }, 401)
        }
        await next()
    })
        .route('/health', healthRoutes)
        .route('/teams', teamsRoutes)
        .route('/projects', projectsRoutes)
        .route('/lanes', lanesRoutes)
        .route('/tasks', tasksRoutes)
        .route('/integrations/trello', trelloProtectedRoutes)
    
    const finalApp = finalApi.route('/', protectedRoutes)
    
    //
    
    // 404 handler
    finalApp.notFound(c => c.json({ error: 'Not Found' }, 404))
    
    // Error handler
    finalApp.onError((err: Error, c: Context) => {
        log.e(err)
        return c.json({ error: 'Internal Server Error' }, 500)
    })
    
    return finalApp
    
}

const app = createApiServer()
export type AppType = typeof app

export default app
