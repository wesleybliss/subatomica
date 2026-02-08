import { Hono } from 'hono'
import { ApiAppEnv } from '@/env'

export default (app: Hono<ApiAppEnv>) => {
    
    app.get('/health', c => c.json({ ok: true }))
    
}
