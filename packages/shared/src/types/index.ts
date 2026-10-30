// Type-only — a value `import 'react'` breaks Vite/Rollup on Vercel because
// @repo/shared does not depend on the react runtime (only @types/react).
import type {} from 'react'

export * from './app.types'
export * from './debug.types'
export * from './kanban.types'
export * from './lanes.types'
export * from './logger.types'
export * from './projects.types'
export * from './store.types'
export * from './tasks.types'
export * from './teams.types'

declare module 'react' {
    interface CSSProperties {
        [key: `--${string}`]: string | number
    }
}
