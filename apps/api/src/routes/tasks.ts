import type { RouteHandler } from '@hono/zod-openapi'
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { SuccessSchema, TaskSchema } from '@repo/db/openapi'
import { HTTPException } from 'hono/http-exception'

import { ApiAppEnv } from '@/env'
import { createResponses } from '@/openapi/responses'
import * as tasksService from '@/services/tasks'

const TaskParamSchema = z.object({
    taskId: z.string().openapi({
        param: { name: 'taskId', in: 'path' },
        example: '019c416f-d018-721f-b332-e9424030c6a8',
    }),
})

const TaskQuerySchema = z.object({
    teamId: z.string().openapi({
        param: { name: 'teamId', in: 'query' },
        example: '019c416f-d018-721f-b332-e9424030c6a8',
    }),
    projectId: z.string().optional().openapi({
        param: { name: 'projectId', in: 'query' },
        example: '019c416f-d018-721f-b332-e9424030c6a8',
    }),
})

const TaskCreateSchema = z
    .object({
        title: z.string().min(1).optional().openapi({
            example: 'Set up OpenAPI docs',
        }),
        status: z.string().min(1).optional().openapi({
            example: 'backlog',
        }),
        description: z.string().optional().openapi({
            example: 'Add OpenAPI routes and schemas',
        }),
        order: z.number().int().optional().openapi({
            example: 1000,
        }),
        tempId: z.string().optional().openapi({
            example: 'temp-task-1',
        }),
    })
    .openapi('TaskCreate')

const TaskUpdateSchema = z
    .object({
        title: z.string().min(1).optional().openapi({
            example: 'Set up OpenAPI docs',
        }),
        status: z.string().min(1).optional().openapi({
            example: 'in-progress',
        }),
        description: z.string().optional().openapi({
            example: 'Implement zod-openapi and docs UI',
        }),
        order: z.number().int().optional().openapi({
            example: 2000,
        }),
    })
    .refine(value => Object.keys(value).length > 0, {
        message: 'At least one field is required',
    })
    .openapi('TaskUpdate')

const getTasksRoute = createRoute({
    method: 'get',
    path: '/',
    tags: ['Tasks'],
    security: [{ bearerAuth: [] }],
    request: {
        query: TaskQuerySchema,
    },
    responses: {
        ...createResponses(z.array(TaskSchema), {
            successDescription: 'Tasks list',
            errorStatuses: [401, 500],
        }),
    },
})

const getTaskByIdRoute = createRoute({
    method: 'get',
    path: '/{taskId}',
    tags: ['Tasks'],
    security: [{ bearerAuth: [] }],
    request: {
        params: TaskParamSchema,
        query: TaskQuerySchema,
    },
    responses: {
        ...createResponses(TaskSchema, {
            successDescription: 'Task details',
            errorStatuses: [401, 404, 500],
        }),
    },
})

const createTaskRoute = createRoute({
    method: 'post',
    path: '/',
    tags: ['Tasks'],
    security: [{ bearerAuth: [] }],
    request: {
        query: TaskQuerySchema,
        body: {
            content: {
                'application/json': {
                    schema: TaskCreateSchema,
                },
            },
        },
    },
    responses: {
        ...createResponses(TaskSchema, {
            successStatus: 201,
            successDescription: 'Created task',
            errorStatuses: [400, 401, 403, 404, 409, 422, 500],
        }),
    },
})

const createTaskWithIdRoute = createRoute({
    method: 'post',
    path: '/{taskId}',
    tags: ['Tasks'],
    security: [{ bearerAuth: [] }],
    request: {
        params: TaskParamSchema,
        query: TaskQuerySchema,
        body: {
            content: {
                'application/json': {
                    schema: TaskCreateSchema,
                },
            },
        },
    },
    responses: {
        ...createResponses(TaskSchema, {
            successStatus: 201,
            successDescription: 'Created task',
            errorStatuses: [400, 401, 403, 404, 409, 422, 500],
        }),
    },
})

const updateTaskRoute = createRoute({
    method: 'patch',
    path: '/{taskId}',
    tags: ['Tasks'],
    security: [{ bearerAuth: [] }],
    request: {
        params: TaskParamSchema,
        query: TaskQuerySchema,
        body: {
            content: {
                'application/json': {
                    schema: TaskUpdateSchema,
                },
            },
        },
    },
    responses: {
        ...createResponses(TaskSchema, {
            successDescription: 'Updated task',
            errorStatuses: [400, 401, 403, 404, 409, 422, 500],
        }),
    },
})

const deleteTaskRoute = createRoute({
    method: 'delete',
    path: '/{taskId}',
    tags: ['Tasks'],
    security: [{ bearerAuth: [] }],
    request: {
        params: TaskParamSchema,
        query: TaskQuerySchema,
    },
    responses: {
        ...createResponses(SuccessSchema, {
            successDescription: 'Deleted task',
            errorStatuses: [400, 401, 403, 404, 409, 422, 500],
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

const getTasks: RouteHandler<typeof getTasksRoute, ApiAppEnv> = async c => {
    const user = c.get('user')
    
    if (!user)
        throw new HTTPException(401, { message: 'Unauthorized' })
    
    const { teamId, projectId } = c.req.valid('query')
    
    const tasks = await tasksService.getTasks(user.id, teamId, projectId)
    const tasksWithKeys = await Promise.all(tasks.map(async task => ({
        ...task,
        key: await tasksService.getTaskSlug(task.projectId, task.id),
    })))
    
    return c.json(tasksWithKeys, 200)
}

const getTaskById: RouteHandler<typeof getTaskByIdRoute, ApiAppEnv> = async c => {
    const user = c.get('user')
    
    if (!user)
        throw new HTTPException(401, { message: 'Unauthorized' })
    
    const { taskId } = c.req.valid('param')
    const { teamId, projectId } = c.req.valid('query')
    
    const task = await tasksService.getTaskById(user.id, teamId, projectId as string, taskId)
    
    if (!task)
        return c.json(task, 200)
    
    const slug = await tasksService.getTaskSlug(task.projectId, task.id)
    
    return c.json({
        ...task,
        slug,
    }, 200)
}

const createTask: RouteHandler<typeof createTaskRoute, ApiAppEnv> = async c => {
    try {
        const user = c.get('user')
        
        if (!user)
            throw new HTTPException(401, { message: 'Unauthorized' })
        
        const { teamId, projectId } = c.req.valid('query')
        
        if (!projectId)
            throw new HTTPException(422, { message: 'Param projectId required' })
        
        const payload = c.req.valid('json')
        
        const task = await tasksService.createTask(user.id, teamId, projectId, payload)
        const slug = await tasksService.getTaskSlug(task.projectId, task.id)
        
        return c.json({
            ...task,
            slug,
        }, 201)
    } catch (error) {
        return handleRouteError(error)
    }
}

const createTaskWithId: RouteHandler<typeof createTaskWithIdRoute, ApiAppEnv> = async c => {
    try {
        const user = c.get('user')
        
        if (!user)
            throw new HTTPException(401, { message: 'Unauthorized' })
        
        const { teamId, projectId } = c.req.valid('query')
        
        if (!projectId)
            throw new HTTPException(422, { message: 'Param projectId required' })
        
        const { taskId } = c.req.valid('param')
        const payload = c.req.valid('json')
        const task = await tasksService.createTask(user.id, teamId, projectId, { ...payload, id: taskId })
        const slug = await tasksService.getTaskSlug(task.projectId, task.id)
        return c.json({
            ...task,
            slug,
        }, 201)
    } catch (error) {
        return handleRouteError(error)
    }
}

const updateTask: RouteHandler<typeof updateTaskRoute, ApiAppEnv> = async c => {
    try {
        const user = c.get('user')
        
        if (!user)
            throw new HTTPException(401, { message: 'Unauthorized' })
        
        const { teamId, projectId } = c.req.valid('query')
        
        if (!projectId)
            throw new HTTPException(422, { message: 'Param projectId required' })
        
        const { taskId } = c.req.valid('param')
        const payload = c.req.valid('json')
        
        const task = await tasksService.updateTask(user.id, teamId, projectId, taskId, payload)
        const slug = await tasksService.getTaskSlug(task.projectId, task.id)
        
        return c.json({
            ...task,
            slug,
        }, 200)
    } catch (error) {
        return handleRouteError(error)
    }
}

const deleteTask: RouteHandler<typeof deleteTaskRoute, ApiAppEnv> = async c => {
    try {
        const user = c.get('user')
        
        if (!user)
            throw new HTTPException(401, { message: 'Unauthorized' })
        
        const { teamId, projectId } = c.req.valid('query')
        
        if (!projectId)
            throw new HTTPException(422, { message: 'Param projectId required' })
        
        const { taskId } = c.req.valid('param')
        
        await tasksService.deleteTask(user.id, teamId, projectId, taskId)
        
        return c.json({ success: true }, 200)
    } catch (error) {
        return handleRouteError(error)
    }
}

const routes = new OpenAPIHono<ApiAppEnv>()
    .openapi(getTasksRoute, getTasks)
    .openapi(getTaskByIdRoute, getTaskById)
    .openapi(createTaskRoute, createTask)
    .openapi(createTaskWithIdRoute, createTaskWithId)
    .openapi(updateTaskRoute, updateTask)
    .openapi(deleteTaskRoute, deleteTask)

export default routes
