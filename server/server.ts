import app from '@api/app'

/**
 * Prefixes owned by the Hono API. Everything else falls through to the Vite SPA.
 * Keep in sync with former Vite proxy paths in apps/web/vite.config.
 */
const API_PREFIXES = [
    '/auth',
    '/session',
    '/teams',
    '/projects',
    '/lanes',
    '/tasks',
    '/integrations',
    '/health',
    '/openapi.json',
    '/docs',
    '/doc',
    '/ui',
]

const isApiPath = (pathname: string) =>
    API_PREFIXES.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`))

/**
 * Nitro server entry: hand API paths to Hono; return nothing so the SPA renderer
 * serves index.html for UI routes (same-origin, no Vite proxy / Vercel rewrites).
 */
export default {
    async fetch(req: Request) {
        const { pathname } = new URL(req.url)
        if (!isApiPath(pathname))
            return
        return app.fetch(req)
    },
}
