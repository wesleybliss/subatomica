import { Context, Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { z } from 'zod'
import * as tasksService from '@/services/tasks'
import { ApiAppEnv } from '@/env'

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

export const getTasks = async (c: Context) => {
    
    const user = c.get('user')
    const teamId = c.req.param('teamId')
    const projectId = c.req.param('projectId')
    
    const tasks = await tasksService.getTasks(user.id, teamId, projectId)
    
    return c.json(tasks)
    
}

export const getTaskById = async (c: Context) => {
    
    const user = c.get('user')
    const teamId = c.req.param('teamId')
    const projectId = c.req.param('projectId')
    const taskId = c.req.param('taskId')
    
    const task = await tasksService.getTaskById(user.id, teamId, projectId, taskId)
    
    return c.json(task)
    
}

export const createTask = async (c: Context) => {
    try {
        const user = c.get('user')
        const teamId = c.req.param('teamId')
        const projectId = c.req.param('projectId')
        const payload = TaskCreateSchema.parse(await c.req.json())
        
        const task = await tasksService.createTask(user.id, teamId, projectId, payload)
        
        return c.json(task, 201)
    } catch (error) {
        handleRouteError(error)
    }
}

export const createTaskWithId = async (c: Context) => {
    try {
        const user = c.get('user')
        const teamId = c.req.param('teamId')
        const projectId = c.req.param('projectId')
        const taskId = c.req.param('taskId')
        const payload = TaskCreateSchema.parse(await c.req.json())
        const task = await tasksService.createTask(user.id, teamId, projectId, { ...payload, id: taskId })
        return c.json(task, 201)
    } catch (error) {
        handleRouteError(error)
    }
}

export const updateTask = async (c: Context) => {
    try {
        const user = c.get('user')
        const teamId = c.req.param('teamId')
        const projectId = c.req.param('projectId')
        const taskId = c.req.param('taskId')
        const payload = TaskUpdateSchema.parse(await c.req.json())
        
        const task = await tasksService.updateTask(user.id, teamId, projectId, taskId, payload)
        
        return c.json(task)
    } catch (error) {
        handleRouteError(error)
    }
}

export const deleteTask = async (c: Context) => {
    try {
        const user = c.get('user')
        const teamId = c.req.param('teamId')
        const projectId = c.req.param('projectId')
        const taskId = c.req.param('taskId')
        
        await tasksService.deleteTask(user.id, teamId, projectId, taskId)
        
        return c.json({ success: true })
    } catch (error) {
        handleRouteError(error)
    }
}

const routes = new Hono<ApiAppEnv>()
    .get('/', getTasks)
    .get('/:taskId', getTaskById)
    .post('/', createTask)
    .post('/:taskId', createTaskWithId)
    .patch('/:taskId', updateTask)
    .delete('/:taskId', deleteTask)

export default routes
