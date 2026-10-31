import path from 'node:path'
import { fileURLToPath } from 'node:url'

import dotenv from 'dotenv'

const apiRoot = path.dirname(fileURLToPath(import.meta.url))
const monorepoRoot = path.resolve(apiRoot, '../..')

dotenv.config({ path: path.join(monorepoRoot, '.env') })
