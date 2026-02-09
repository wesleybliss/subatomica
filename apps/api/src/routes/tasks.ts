import { Context, Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { z } from 'zod'
import * as tasksService from '@/services/tasks'
import { ApiAppEnv } from '@/env'
import { zValidator } from '@/lib/honoZodValidator'

const TaskParamSchema = z.object({
    taskId: z.string(),
})

const TaskQuerySchema = z.object({
    teamId: z.string(),
    projectId: z.string().optional(),
})

const taskParamValidator = zValidator('param', TaskParamSchema)
const taskQueryValidator = zValidator('query', TaskQuerySchema)

type TaskContext = Context<ApiAppEnv, string, {
    out: {
        query: z.infer<typeof TaskQuerySchema>,
        param: z.infer<typeof TaskParamSchema>,
    }
}>

const TaskCreateSchema = z.object({
    title: z.string().min(1).optional(),
    status: z.string().min(1).optional(),
    description: z.string().optional(),
    order: z.number().int().optional(),
    tempId: z.string().optional(),
})

const TaskUpdateSchema = z.object({
    title: z.string().min(1).optional(),
    status: z.string().min(1).optional(),
    description: z.string().optional(),
    order: z.number().int().optional(),
}).refine(value => Object.keys(value).length > 0, {
    message: 'At least one field is required',
})

const handleRouteError = (error: unknown) => {
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

export const getTasks = async (c: TaskContext) => {
    
    const user = c.get('user')
    
    if (!user)
        throw new HTTPException(401, { message: 'Unauthorized' })
    
    const { teamId, projectId } = c.req.valid('query')
    
    const tasks = await tasksService.getTasks(user.id, teamId, projectId)
    
    return c.json(tasks)
    
}

export const getTaskById = async (c: TaskContext) => {
    
    const user = c.get('user')
    
    if (!user)
        throw new HTTPException(401, { message: 'Unauthorized' })
    
    const body = await c.req.json()
    const { taskId } = c.req.valid('param')
    const { teamId, projectId } = body
    
    const task = await tasksService.getTaskById(user.id, teamId, projectId, taskId)
    
    return c.json(task)
    
}

export const createTask = async (c: TaskContext) => {
    try {
        const user = c.get('user')
        
        if (!user)
            throw new HTTPException(401, { message: 'Unauthorized' })
        
        const { teamId, projectId } = c.req.valid('query')
        
        if (!projectId)
            throw new HTTPException(422, { message: 'Param projectId required' })
        
        const payload = TaskCreateSchema.parse(await c.req.json())
        
        const task = await tasksService.createTask(user.id, teamId, projectId, payload)
        
        return c.json(task, 201)
    } catch (error) {
        handleRouteError(error)
    }
}

export const createTaskWithId = async (c: TaskContext) => {
    try {
        const user = c.get('user')
        
        if (!user)
            throw new HTTPException(401, { message: 'Unauthorized' })
        
        const { teamId, projectId } = c.req.valid('query')
        
        if (!projectId)
            throw new HTTPException(422, { message: 'Param projectId required' })
        
        const { taskId } = c.req.valid('param')
        const payload = TaskCreateSchema.parse(await c.req.json())
        const task = await tasksService.createTask(user.id, teamId, projectId, { ...payload, id: taskId })
        return c.json(task, 201)
    } catch (error) {
        handleRouteError(error)
    }
}

export const updateTask = async (c: TaskContext) => {
    try {
        const user = c.get('user')
        
        if (!user)
            throw new HTTPException(401, { message: 'Unauthorized' })
        
        const { teamId, projectId } = c.req.valid('query')
        
        if (!projectId)
            throw new HTTPException(422, { message: 'Param projectId required' })
        
        const { taskId } = c.req.valid('param')
        const payload = TaskUpdateSchema.parse(await c.req.json())
        
        const task = await tasksService.updateTask(user.id, teamId, projectId, taskId, payload)
        
        return c.json(task)
    } catch (error) {
        handleRouteError(error)
    }
}

export const deleteTask = async (c: TaskContext) => {
    try {
        const user = c.get('user')
        
        if (!user)
            throw new HTTPException(401, { message: 'Unauthorized' })
        
        const { teamId, projectId } = c.req.valid('query')
        
        if (!projectId)
            throw new HTTPException(422, { message: 'Param projectId required' })
        
        const { taskId } = c.req.valid('param')
        
        await tasksService.deleteTask(user.id, teamId, projectId, taskId)
        
        return c.json({ success: true })
    } catch (error) {
        handleRouteError(error)
    }
}

const routes = new Hono<ApiAppEnv>()
    .get('/', taskQueryValidator, getTasks)
    .get('/:taskId', taskParamValidator, taskQueryValidator, getTaskById)
    .post('/', taskQueryValidator, createTask)
    .post('/:taskId', taskQueryValidator, createTaskWithId)
    .patch('/:taskId', taskParamValidator, taskQueryValidator, updateTask)
    .delete('/:taskId', taskParamValidator, taskQueryValidator, deleteTask)

export default routes
