import type { RouteHandler } from '@hono/zod-openapi'
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { TaskSchema } from '@repo/db/openapi'
import { HTTPException } from 'hono/http-exception'

import { ApiAppEnv } from '@/env'
import { createAblyTokenRequest, isAblyConfigured } from '@/lib/ably'
import { createResponses } from '@/openapi/responses'
import * as tasksService from '@/services/tasks'

const ProjectScopeQuery = z.object({
    teamId: z.string(),
    projectId: z.string(),
})

const pullRoute = createRoute({
    method: 'get',
    path: '/pull',
    tags: ['Sync'],
    security: [{ bearerAuth: [] }],
    request: {
        query: ProjectScopeQuery.extend({
            since: z.string().openapi({
                description: 'ISO timestamp cursor; return tasks with updatedAt > since',
            }),
        }),
    },
    responses: {
        ...createResponses(z.object({
            tasks: z.array(TaskSchema),
            cursor: z.string(),
        }), {
            successDescription: 'Task changes since cursor',
            errorStatuses: [401, 422, 500],
        }),
    },
})

const SyncChangeSchema = z.object({
    id: z.string(),
    updatedAt: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
    status: z.string().optional(),
    order: z.number().optional(),
})

const pushRoute = createRoute({
    method: 'post',
    path: '/push',
    tags: ['Sync'],
    security: [{ bearerAuth: [] }],
    request: {
        query: ProjectScopeQuery,
        body: {
            content: {
                'application/json': {
                    schema: z.object({
                        changes: z.array(SyncChangeSchema),
                    }),
                },
            },
        },
    },
    responses: {
        ...createResponses(z.object({
            applied: z.array(TaskSchema),
            cursor: z.string(),
        }), {
            successDescription: 'Applied LWW task changes',
            errorStatuses: [401, 422, 500],
        }),
    },
})

const ablyTokenRoute = createRoute({
    method: 'post',
    path: '/ably-token',
    tags: ['Sync'],
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: z.object({
                        projectIds: z.array(z.string()).min(1),
                    }),
                },
            },
        },
    },
    responses: {
        ...createResponses(z.object({
            enabled: z.boolean(),
            tokenRequest: z.unknown().optional(),
        }), {
            successDescription: 'Ably token request for client subscribe',
            errorStatuses: [401, 500],
        }),
    },
})

const handleRouteError = (error: unknown) => {
    if (error instanceof HTTPException) throw error
    const message = error instanceof Error ? error.message : 'Unknown error'
    if (message.startsWith('NotFound:'))
        throw new HTTPException(404, { message })
    throw new HTTPException(500, { message })
}

const pull: RouteHandler<typeof pullRoute, ApiAppEnv> = async c => {
    try {
        const user = c.get('user')
        if (!user) throw new HTTPException(401, { message: 'Unauthorized' })
        
        const { teamId, projectId, since } = c.req.valid('query')
        const tasks = await tasksService.getTasksUpdatedSince(user.id, teamId, projectId, since)
        const latest = tasks.reduce((max, task) => {
            const ts = task.updatedAt ?? ''
            return ts > max ? ts : max
        }, since)
        
        return c.json({ tasks, cursor: latest }, 200)
    } catch (error) {
        return handleRouteError(error)
    }
}

const push: RouteHandler<typeof pushRoute, ApiAppEnv> = async c => {
    try {
        const user = c.get('user')
        if (!user) throw new HTTPException(401, { message: 'Unauthorized' })
        
        const { teamId, projectId } = c.req.valid('query')
        const { changes } = c.req.valid('json')
        const applied = await tasksService.applyTaskSyncPush(
            user.id,
            teamId,
            projectId,
            changes,
        )
        const cursor = applied.reduce((max, task) => {
            const ts = task.updatedAt ?? ''
            return ts > max ? ts : max
        }, new Date(0).toISOString())
        
        return c.json({ applied, cursor }, 200)
    } catch (error) {
        return handleRouteError(error)
    }
}

const ablyToken: RouteHandler<typeof ablyTokenRoute, ApiAppEnv> = async c => {
    try {
        const user = c.get('user')
        if (!user) throw new HTTPException(401, { message: 'Unauthorized' })
        
        if (!isAblyConfigured())
            return c.json({ enabled: false }, 200)
        
        const { projectIds } = c.req.valid('json')
        const tokenRequest = await createAblyTokenRequest(user.id, projectIds)
        return c.json({ enabled: true, tokenRequest }, 200)
    } catch (error) {
        return handleRouteError(error)
    }
}

const routes = new OpenAPIHono<ApiAppEnv>()
    .openapi(pullRoute, pull)
    .openapi(pushRoute, push)
    .openapi(ablyTokenRoute, ablyToken)

export default routes
