import type { RouteHandler } from '@hono/zod-openapi'
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { SuccessSchema, TaskLaneSchema } from '@repo/db/openapi'
import { HTTPException } from 'hono/http-exception'

import { ApiAppEnv } from '@/env'
import { createResponses } from '@/openapi/responses'
import * as lanesService from '@/services/lanes'

const LaneParamSchema = z.object({
    laneId: z.string().openapi({
        param: { name: 'laneId', in: 'path' },
        example: '019c416f-d018-721f-b332-e9424030c6a8',
    }),
})

const LaneQuerySchema = z.object({
    teamId: z.string().openapi({
        param: { name: 'teamId', in: 'query' },
        example: '019c416f-d018-721f-b332-e9424030c6a8',
    }),
    projectId: z.string().openapi({
        param: { name: 'projectId', in: 'query' },
        example: '019c416f-d018-721f-b332-e9424030c6a8',
    }),
})

const TaskLaneCreateSchema = z
    .object({
        key: z.string().min(1).optional().openapi({
            example: 'todo',
        }),
        name: z.string().min(1).optional().openapi({
            example: 'To Do',
        }),
        color: z.string().nullable().optional().openapi({
            example: '#f97316',
        }),
        order: z.number().int().optional().openapi({
            example: 1000,
        }),
        isDefault: z.boolean().optional().openapi({
            example: false,
        }),
        tempId: z.string().optional().openapi({
            example: 'temp-lane-1',
        }),
    })
    .openapi('TaskLaneCreate')

const TaskLaneUpdateSchema = z
    .object({
        key: z.string().min(1).optional().openapi({
            example: 'todo',
        }),
        name: z.string().min(1).optional().openapi({
            example: 'To Do',
        }),
        color: z.string().nullable().optional().openapi({
            example: '#f97316',
        }),
        order: z.number().int().optional().openapi({
            example: 1000,
        }),
        isDefault: z.boolean().optional().openapi({
            example: false,
        }),
    })
    .refine(value => Object.keys(value).length > 0, {
        message: 'At least one field is required',
    })
    .openapi('TaskLaneUpdate')

const getTaskLanesRoute = createRoute({
    method: 'get',
    path: '/',
    tags: ['Lanes'],
    security: [{ bearerAuth: [] }],
    request: {
        query: LaneQuerySchema,
    },
    responses: {
        ...createResponses(z.array(TaskLaneSchema), {
            successDescription: 'Task lanes list',
            errorStatuses: [400, 401, 403, 404, 409, 500],
        }),
    },
})

const createTaskLaneRoute = createRoute({
    method: 'post',
    path: '/',
    tags: ['Lanes'],
    security: [{ bearerAuth: [] }],
    request: {
        query: LaneQuerySchema,
        body: {
            content: {
                'application/json': {
                    schema: TaskLaneCreateSchema,
                },
            },
        },
    },
    responses: {
        ...createResponses(TaskLaneSchema, {
            successStatus: 201,
            successDescription: 'Created task lane',
            errorStatuses: [400, 401, 403, 404, 409, 500],
        }),
    },
})

const updateTaskLaneRoute = createRoute({
    method: 'patch',
    path: '/{laneId}',
    tags: ['Lanes'],
    security: [{ bearerAuth: [] }],
    request: {
        params: LaneParamSchema,
        query: LaneQuerySchema,
        body: {
            content: {
                'application/json': {
                    schema: TaskLaneUpdateSchema,
                },
            },
        },
    },
    responses: {
        ...createResponses(TaskLaneSchema, {
            successDescription: 'Updated task lane',
            errorStatuses: [400, 401, 403, 404, 409, 500],
        }),
    },
})

const deleteTaskLaneRoute = createRoute({
    method: 'delete',
    path: '/{laneId}',
    tags: ['Lanes'],
    security: [{ bearerAuth: [] }],
    request: {
        params: LaneParamSchema,
        query: LaneQuerySchema,
    },
    responses: {
        ...createResponses(SuccessSchema, {
            successDescription: 'Deleted task lane',
            errorStatuses: [400, 401, 403, 404, 409, 500],
        }),
    },
})

const handleRouteError = (error: unknown): never => {
    if (error instanceof HTTPException)
        throw error
    
    const message = error instanceof Error
        ? error.message
        : 'Unknown error'
    
    if (message.startsWith('Forbidden:'))
        throw new HTTPException(403, { message })
    if (message.startsWith('NotFound:'))
        throw new HTTPException(404, { message })
    if (message.startsWith('Conflict:'))
        throw new HTTPException(409, { message })
    
    throw new HTTPException(400, { message })
}

const getTaskLanes: RouteHandler<typeof getTaskLanesRoute, ApiAppEnv> = async c => {
    try {
        const user = c.get('user')
        
        if (!user)
            throw new HTTPException(401, { message: 'Unauthorized' })
        
        const { teamId, projectId } = c.req.valid('query')
        const lanes = await lanesService.getTaskLanes(user.id, teamId, projectId)
        return c.json(lanes, 200)
    } catch (error) {
        return handleRouteError(error)
    }
}

const createTaskLane: RouteHandler<typeof createTaskLaneRoute, ApiAppEnv> = async c => {
    try {
        const user = c.get('user')
        
        if (!user)
            throw new HTTPException(401, { message: 'Unauthorized' })
        
        const { teamId, projectId } = c.req.valid('query')
        const payload = c.req.valid('json')
        const lane = await lanesService.createTaskLane(user.id, teamId, projectId, payload)
        return c.json(lane, 201)
    } catch (error) {
        return handleRouteError(error)
    }
}

const updateTaskLane: RouteHandler<typeof updateTaskLaneRoute, ApiAppEnv> = async c => {
    try {
        const user = c.get('user')
        
        if (!user)
            throw new HTTPException(401, { message: 'Unauthorized' })
        
        const { laneId } = c.req.valid('param')
        const { teamId, projectId } = c.req.valid('query')
        const payload = c.req.valid('json')
        const lane = await lanesService.updateTaskLane(user.id, teamId, projectId, laneId, payload)
        return c.json(lane, 200)
    } catch (error) {
        return handleRouteError(error)
    }
}

const deleteTaskLane: RouteHandler<typeof deleteTaskLaneRoute, ApiAppEnv> = async c => {
    try {
        const user = c.get('user')
        
        if (!user)
            throw new HTTPException(401, { message: 'Unauthorized' })
        
        const { laneId } = c.req.valid('param')
        const { teamId, projectId } = c.req.valid('query')
        await lanesService.deleteTaskLane(user.id, teamId, projectId, laneId)
        return c.json({ success: true }, 200)
    } catch (error) {
        return handleRouteError(error)
    }
}

const routes = new OpenAPIHono<ApiAppEnv>()
    .openapi(getTaskLanesRoute, getTaskLanes)
    .openapi(createTaskLaneRoute, createTaskLane)
    .openapi(updateTaskLaneRoute, updateTaskLane)
    .openapi(deleteTaskLaneRoute, deleteTaskLane)

export default routes
