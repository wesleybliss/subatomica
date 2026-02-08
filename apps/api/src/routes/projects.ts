import { Context, Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { z } from 'zod'
// import { ProjectSchema } from '@repo/shared/schemas/project'
import * as projectsService from '@/services/projects'
import { ApiAppEnv } from '@/env'

const ProjectCreateSchema = z.object({
    name: z.string().min(1),
})

const ProjectRenameSchema = z.object({
    name: z.string().min(1),
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

export const createProject = async (c: Context) => {
    try {
        const user = c.get('user')
        const teamId = c.req.param('teamId')
        const payload = ProjectCreateSchema.parse(await c.req.json())
        
        const project = await projectsService.createProject(user.id, teamId, payload.name)
        
        return c.json(project, 201)
    } catch (error) {
        handleRouteError(error)
    }
}

export const renameProject = async (c: Context) => {
    try {
        const user = c.get('user')
        const projectId = c.req.param('projectId')
        const payload = ProjectRenameSchema.parse(await c.req.json())
        
        const project = await projectsService.renameProject(user.id, projectId, payload.name)
        
        return c.json(project)
    } catch (error) {
        handleRouteError(error)
    }
}

export const deleteProject = async (c: Context) => {
    try {
        const user = c.get('user')
        const projectId = c.req.param('projectId')
        
        await projectsService.deleteProject(user.id, projectId)
        
        return c.json({ success: true })
    } catch (error) {
        handleRouteError(error)
    }
}

const routes = new Hono<ApiAppEnv>()
    .get('/', getProjects)
    .post('/', createProject)
    .get('/:projectId', getProjectById)
    .patch('/:projectId', renameProject)
    .delete('/:projectId', deleteProject)

export default routes
