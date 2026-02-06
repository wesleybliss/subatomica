import { Hono } from 'hono'

export default (app: Hono) => {
  
    app.get('/health', c => c.json({ ok: true }))
    
}
