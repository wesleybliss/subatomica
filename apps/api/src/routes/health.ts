import { Hono } from 'hono'
import { ApiAppEnv } from '@/env'

const routes = new Hono<ApiAppEnv>()
    .get('/', c => c.json({ ok: true }))

export default routes
