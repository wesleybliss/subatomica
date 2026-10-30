// Leave VITE_BETTER_AUTH_URL empty for same-origin relative paths.
// Nitro serves the Hono API on the same host as the Vite SPA (dev + Vercel).
// Set an absolute URL only when the API is on a different origin.
const envBase = import.meta.env.VITE_BETTER_AUTH_URL as string | undefined

export const API_BASE: string = envBase && envBase.length > 0 ? envBase.replace(/\/$/, '') : ''
