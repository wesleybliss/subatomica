import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'
import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite'

import aliases, { ROOT } from './aliases.ts'

// Node-side config (USE_LOCAL_HTTPS, etc.). Client VITE_* come from envDir below.
dotenv.config({ path: path.join(ROOT, '.env') })

const SERVER_DIR = path.join(ROOT, 'server')

const certUri = (name: string) =>
    path.join(os.homedir(), name)

const readCert = (name: string) =>
    fs.readFileSync(certUri(`localhost/_certs/${name}`))

const serverConfig = process.env.USE_LOCAL_HTTPS === 'true' ? {
    https: {
        cert: readCert('geekom-a7.ide-cherimoya.ts.net.crt'),
        key: readCert('geekom-a7.ide-cherimoya.ts.net.key'),
    },
} : {}

// https://vitejs.dev/config/
export default defineConfig({
    // Load repo-root .env so import.meta.env.VITE_* matches the shared env file.
    envDir: ROOT,
    plugins: [
        react(),
        tailwindcss(),
        nitro(),
    ],
    nitro: {
        serverDir: SERVER_DIR,
        serverEntry: path.join(SERVER_DIR, 'server.ts'),
        ...(process.env.VERCEL
            ? { preset: 'vercel', output: { dir: path.join(ROOT, '.vercel', 'output') } }
            : {}),
    },
    resolve: {
        alias: aliases,
    },
    optimizeDeps: {
        exclude: ['lucide-react'],
    },
    server: {
        ...serverConfig,
        host: '0.0.0.0',
        allowedHosts: ['geekom-a7', 'geekom-a7.ide-cherimoya.ts.net'],
    },
})
