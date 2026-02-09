import 'dotenv/config'
import { Context } from 'hono'
import { OpenAPIHono } from '@hono/zod-openapi'
import { swaggerUI } from '@hono/swagger-ui'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import pkg from '../../../package.json' assert { type: 'json' }
import { auth as defaultAuth } from '@/services/auth' // BetterAuth instance
import healthRoutes from '@/routes/health'
import teamsRoutes from '@/routes/teams'
import projectsRoutes from '@/routes/projects'
import lanesRoutes from '@/routes/lanes'
import tasksRoutes from '@/routes/tasks'
import { ApiAppEnv, createApp } from '@/env'
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
        allowMethods: ['POST', 'GET', 'PATCH', 'DELETE', 'OPTIONS'],
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
    
    const finalApp = finalApi.route('/', protectedRoutes)
    
    //
    
    // 404 handler
    finalApp.notFound(c => c.json({ error: 'Not Found' }, 404))
    
    // Error handler
    finalApp.onError((err: Error, c: Context) => {
        console.error(err)
        return c.json({ error: 'Internal Server Error' }, 500)
    })
    
    return finalApp
    
}

const app = createApiServer()
export type AppType = typeof app

export default app
