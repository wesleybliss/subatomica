import type { RouteHandler } from '@hono/zod-openapi'
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'

import { ApiAppEnv } from '@/env'
import { createResponses } from '@/openapi/responses'

const healthRoute = createRoute({
    method: 'get',
    path: '/',
    tags: ['Health'],
    security: [{ bearerAuth: [] }],
    responses: {
        ...createResponses(z.object({
            ok: z.boolean().openapi({ example: true }),
        }).openapi('Health'), {
            successDescription: 'Health check',
            errorStatuses: [401],
        }),
    },
})

const healthHandler: RouteHandler<typeof healthRoute, ApiAppEnv> = c =>
    c.json({ ok: true }, 200)

const routes = new OpenAPIHono<ApiAppEnv>()
    .openapi(healthRoute, healthHandler)

export default routes
