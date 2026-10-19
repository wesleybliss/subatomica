/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_BETTER_AUTH_URL?: string
    readonly VITE_BETTER_AUTH_TRUSTED_ORIGINS?: string
    readonly VITE_PUBLIC_APP_URL?: string
    readonly VITE_LOG_ENABLED?: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
