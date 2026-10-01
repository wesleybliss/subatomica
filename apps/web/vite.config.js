import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'
import { defineConfig } from 'vite'

dotenv.config()

const certUri = (name) =>
    path.join(os.homedir(), name)

const readCert = (name) =>
    fs.readFileSync(certUri(`localhost/_certs/${name}`))

const serverConfig = process.env.USE_LOCAL_HTTPS === 'true' ? {
    https: {
        cert: readCert('geekom-a7.ide-cherimoya.ts.net.crt'),
        key: readCert('geekom-a7.ide-cherimoya.ts.net.key'),
    },
} : {}

// Same-origin browser calls (empty VITE_BETTER_AUTH_URL) hit the Vite
// host; proxy those API prefixes to the Hono backend so Tailscale/LAN
// clients never need to reach localhost:5000 directly.
const apiProxyTarget = process.env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:5000'

const apiProxy = {
    target: apiProxyTarget,
    changeOrigin: true,
    xfwd: true,
}

const apiProxyPaths = [
    '/auth',
    '/session',
    '/teams',
    '/projects',
    '/lanes',
    '/tasks',
    '/health',
    '/openapi.json',
    '/docs',
    '/doc',
    '/ui',
]

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    optimizeDeps: {
        exclude: ['lucide-react'],
    },
    resolve: {
        alias: {
            '@': '/src',
        },
    },
    server: {
        ...serverConfig,
        host: '0.0.0.0',
        allowedHosts: ['geekom-a7', 'geekom-a7.ide-cherimoya.ts.net'],
        proxy: Object.fromEntries(apiProxyPaths.map(path => [path, apiProxy])),
    },
})
