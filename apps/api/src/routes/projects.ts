import { Context } from 'hono'
// import { ProjectSchema } from '@repo/shared/schemas/project'
import * as projectsService from '@/services/projects'
import * as tasksService from '@/services/tasks'

export const getProjects = async (c: Context) => {
    
    const user = c.get('user')
    const teamId = c.req.param('teamId')
    
    const projects = await projectsService.getProjects(user.id, teamId)
    
    return c.json(projects)
    
}

export const getProjectById = async (c: Context) => {
    
    const user = c.get('user')
    const teamId = c.req.param('teamId')
    const projectId = c.req.param('projectId')
    
    const project = await projectsService.getProjectById(user.id, teamId, projectId)
    
    return c.json(project)
    
}

export const getProjectTasks = async (c: Context) => {
    
    const user = c.get('user')
    const teamId = c.req.param('teamId')
    const projectId = c.req.param('projectId')
    
    const projectTasks = await tasksService.getTasks(user.id, teamId, projectId)
    
    return c.json(projectTasks)
    
}

export default (app: any) => {
    
    app.get('/teams/:teamId/projects', getProjects)
    app.get('/teams/:teamId/projects/:projectId', getProjectById)
    app.get('/teams/:teamId/projects/:projectId/tasks', getProjectTasks)
    
    
}
