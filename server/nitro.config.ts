import { fileURLToPath } from 'node:url'

import { defineConfig } from 'nitro'

const ROOT = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
    serverDir: ROOT,
    node: true,
    preset: 'vercel',
    serverEntry: './server.ts',
})
