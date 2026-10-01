// Leave VITE_BETTER_AUTH_URL empty to use same-origin relative paths.
// That works from any host (localhost or Tailscale) because Vite proxies
// API routes to the backend. Set an absolute URL only when the API is on
// a different origin the browser can reach directly.
const envBase = import.meta.env.VITE_BETTER_AUTH_URL as string | undefined

export const API_BASE: string = envBase && envBase.length > 0 ? envBase.replace(/\/$/, '') : ''
