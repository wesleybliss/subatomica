import 'dotenv/config'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import pkg from '../../../package.json' assert { type: 'json' }
import { auth as defaultAuth } from '@/services/auth' // BetterAuth instance
import teamsRoutes from '@/routes/teams'
/*import { projectsRoute } from './routes/projects'*/
import { env } from './env'

type Package = {
    version: string
}

export const createApp = (auth = defaultAuth) => {
    
    const app = new Hono<{
        Variables: {
            user: typeof auth.$Infer.Session.user | null;
            session: typeof auth.$Infer.Session.session | null
        }
    }>()
    
    // Global middleware
    app.use('*', cors({
        origin: process.env.BETTER_AUTH_TRUSTED_ORIGINS!.split(','),
        credentials: true, // optional: if you need cookies/auth
        allowHeaders: ["Content-Type", "Authorization"],
        allowMethods: ["POST", "GET", "OPTIONS"],
        exposeHeaders: ["Content-Length"],
        maxAge: 600,
    }))
    app.use('*', logger())
    app.use('*', prettyJSON())
    
    app.get('/', c => c.json({
        version: (pkg as Package).version,
    }))
    
    app.get('/health', c => c.json({
        ok: true,
    }))
    
    // Bind session to context
    app.use('*', async (c, next) => {
        
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
    app.on(['GET', 'POST'], '/auth/*', async (c) => {
        return auth.handler(c.req.raw)
    })
    
    app.get('/session', (c) => {
        
        const session = c.get('session')
        const user = c.get('user')
        
        if (!user) return c.body(null, 401)
        
        return c.json({
            session,
            user
        })
        
    })
    
    const protectRoute = (path: string) => {
        
        app.use(path, async (c, next) => {
            
            const session = await auth.api.getSession({ headers: c.req.raw.headers })
            
            if (!session || !session.user || !session.session)
                // return c.body(null, 401)
                return c.json({ error: 'Unauthorized' }, 401)
            
            await next()
            
        })
        
        return app
        
    }
    
    teamsRoutes(protectRoute('/t/*'))
    
    //
    
    // 404 handler
    app.notFound((c) => c.json({ error: 'Not Found' }, 404))
    
    // Error handler
    app.onError((err, c) => {
        console.error(err)
        return c.json({ error: 'Internal Server Error' }, 500)
    })
    
    return app
    
}

export default createApp()
