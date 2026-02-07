import { Context } from 'hono'
import * as tasksService from '@/services/tasks'

export const getTasks = async (c: Context) => {
    
    const user = c.get('user')
    const teamId = c.req.param('teamId')
    
    const projects = await tasksService.getTasks(user.id, teamId)
    
    return c.json(projects)
    
}

export const getProjectById = async (c: Context) => {
    
    const user = c.get('user')
    const teamId = c.req.param('teamId')
    const projectId = c.req.param('projectId')
    
    const project = await tasksService.getProjectById(user.id, teamId, projectId)
    
    return c.json(project)
    
}

export default (app: any) => {
    
    app.get('/teams/:teamId/projects', getTasks)
    app.get('/teams/:teamId/projects/:projectId', getProjectById)
    
    
}
