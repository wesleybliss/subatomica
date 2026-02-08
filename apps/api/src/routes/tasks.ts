import { Context, Hono } from 'hono'
import * as tasksService from '@/services/tasks'
import { ApiAppEnv } from '@/env'

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

const routes = new Hono<ApiAppEnv>()
    .get('/', getTasks)
    .get('/:taskId', getTaskById)

export default routes
