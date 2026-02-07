import { Context } from 'hono'
import * as tasksService from '@/services/tasks'

export const getTasks = async (c: Context) => {
    
    const user = c.get('user')
    const teamId = c.req.param('teamId')
    const projectId = c.req.param('projectId')
    
    const tasks = await tasksService.getTasks(user.id, projectId, teamId)
    
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

export default (app: any) => {
    
    app.get('/teams/:teamId/projects', getTasks)
    app.get('/teams/:teamId/projects/:projectId', getTaskById)
    
    
}
