import 'dotenv/config'

import { serve } from '@hono/node-server'
import Logger from '@repo/shared/utils/logger'

import app from './app'

const log = new Logger('api/index')

/*const globalForServer = globalThis as unknown as {
    __honoServer?: ReturnType<typeof serve>
}*/

// serve(routes)?
const options = {
    port: parseInt(process.env.PORT || '5000', 10),
    hostname: process.env.HOST || '0.0.0.0',
    fetch: app.fetch,
}

export default options

serve(options, info => {
    log.d(`Running on http://localhost:${info.port}`)
})
