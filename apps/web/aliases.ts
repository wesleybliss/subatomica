import path from 'node:path'
import { fileURLToPath } from 'node:url'

import type { Alias, AliasOptions, ResolverFunction } from 'vite'

const WEB_ROOT = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(WEB_ROOT, '..', '..')
const WEB = path.resolve(WEB_ROOT, 'src')
const API = path.resolve(ROOT, 'apps/api/src')

const isApiImporter = (importer?: string) =>
    !!importer && importer.includes(`${path.sep}apps${path.sep}api${path.sep}`)

/**
 * `@/` means web src for client files and api src for api files.
 * Delegate back to Vite/Rollup so directory index + extensions still resolve.
 * Workspace packages (`@repo/*`) resolve via package exports — do not alias them.
 */
const resolveAt: ResolverFunction = function resolveAt(id, importer, options) {
    const base = isApiImporter(importer) ? API : WEB
    const candidate = path.resolve(base, id)
    return this.resolve(candidate, importer, { ...options, skipSelf: true })
}

const atAlias: Alias = {
    find: /^@\/(.*)/,
    replacement: '$1',
    customResolver: resolveAt,
}

const aliases: AliasOptions = [
    atAlias,
    { find: '@api', replacement: API },
    { find: '@web', replacement: WEB },
]

export default aliases
export { API, ROOT, WEB }
