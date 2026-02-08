import 'dotenv/config'
import app from './app'
import { serve } from '@hono/node-server'

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
    console.log(`Running on http://localhost:${info.port}`)
})
