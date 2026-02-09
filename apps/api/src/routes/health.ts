import type { RouteHandler } from '@hono/zod-openapi'
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'

import { ApiAppEnv } from '@/env'
import { ErrorSchema } from '@/openapi/shared.zod'

const healthRoute = createRoute({
    method: 'get',
    path: '/',
    tags: ['Health'],
    security: [{ bearerAuth: [] }],
    responses: {
        200: {
            description: 'Health check',
            content: {
                'application/json': {
                    schema: z.object({
                        ok: z.boolean().openapi({ example: true }),
                    }).openapi('Health'),
                },
            },
        },
        401: {
            description: 'Unauthorized',
            content: {
                'application/json': {
                    schema: ErrorSchema,
                },
            },
        },
    },
})

const healthHandler: RouteHandler<typeof healthRoute, ApiAppEnv> = c =>
    c.json({ ok: true }, 200)

const routes = new OpenAPIHono<ApiAppEnv>()
    .openapi(healthRoute, healthHandler)

export default routes
