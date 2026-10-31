import type { RouteHandler } from '@hono/zod-openapi'
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'

import { ApiAppEnv } from '@/env'
import { createResponses } from '@/openapi/responses'

const inviteCodeRoute = createRoute({
    method: 'get',
    path: '/',
    tags: ['InviteCode'],
    security: [{ bearerAuth: [] }],
    responses: {
        ...createResponses(z.object({
            ok: z.boolean().openapi({ example: true }),
        }).openapi('InviteCode'), {
            successDescription: 'Invite code',
            errorStatuses: [401],
        }),
    },
})

const inviteCodeHandler: RouteHandler<typeof inviteCodeRoute, ApiAppEnv> = c =>
    c.json({ inviteCode: process.env.INVITE_CODE }, 200)

const routes = new OpenAPIHono<ApiAppEnv>()
    .openapi(inviteCodeRoute, inviteCodeHandler)

export default routes
