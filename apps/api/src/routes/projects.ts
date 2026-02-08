import { Context, Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
// import { ProjectSchema } from '@repo/shared/schemas/project'
import * as projectsService from '@/services/projects'
import { ApiAppEnv } from '@/env'

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
    
    if (!user)
        throw new HTTPException(404, { message: 'Param user required' })
    
    if (!teamId)
        throw new HTTPException(404, { message: 'Param teamId required' })
    
    if (!projectId)
        throw new HTTPException(404, { message: 'Param projectId required' })
    
    const project = await projectsService.getProjectById(user.id, teamId, projectId)
    
    return c.json(project)
    
}

export default (app: Hono<ApiAppEnv>) => {
    
    app.get('/', getProjects)
    app.get('/:projectId', getProjectById)
    
}
