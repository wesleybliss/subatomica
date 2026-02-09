import { Context, Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { z } from 'zod'
// import { ProjectSchema } from '@repo/shared/schemas/project'
import * as projectsService from '@/services/projects'
import { ApiAppEnv } from '@/env'
import { zValidator } from '@/lib/honoZodValidator'

const ProjectParamSchema = z.object({
    projectId: z.string(),
})

const ProjectQuerySchema = z.object({
    teamId: z.string(),
})

const projectParamValidator = zValidator('param', ProjectParamSchema)
const projectQueryValidator = zValidator('query', ProjectQuerySchema)

type ProjectContext = Context<ApiAppEnv, string, {
    out: {
        query: z.infer<typeof ProjectQuerySchema>,
        param: z.infer<typeof ProjectParamSchema>,
    }
}>

const ProjectCreateSchema = z.object({
    name: z.string().min(1),
})

const ProjectUpdateSchema = z.object({
    name: z.string().min(1).optional(),
}).refine(payload => Object.keys(payload).length > 0, {
    message: 'At least one update field is required',
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

export const getProjects = async (c: ProjectContext) => {
    
    const user = c.get('user')
    
    if (!user)
        throw new HTTPException(401, { message: 'Unauthorized' })
    
    const { teamId } = c.req.valid('query')
    
    const projects = await projectsService.getProjects(user.id, teamId)
    
    return c.json(projects)
    
}

export const getProjectById = async (c: ProjectContext) => {
    
    const user = c.get('user')
    const { teamId } = c.req.valid('query')
    const { projectId } = c.req.valid('param')
    
    if (!user)
        throw new HTTPException(401, { message: 'Unauthorized' })
    
    if (!teamId)
        throw new HTTPException(422, { message: 'Param teamId required' })
    
    if (!projectId)
        throw new HTTPException(422, { message: 'Param projectId required' })
    
    const project = await projectsService.getProjectById(user.id, teamId, projectId)
    
    return c.json(project)
    
}

export const createProject = async (c: ProjectContext) => {
    try {
        const user = c.get('user')
        
        if (!user)
            throw new HTTPException(401, { message: 'Unauthorized' })
        
        const { teamId } = c.req.valid('query')
        const body = await c.req.json()
        const payload = ProjectCreateSchema.parse(body)
        
        const project = await projectsService.createProject(user.id, teamId, payload.name)
        
        return c.json(project, 201)
    } catch (error) {
        handleRouteError(error)
    }
}

export const updateProject = async (c: ProjectContext) => {
    try {
        const user = c.get('user')
        
        if (!user)
            throw new HTTPException(401, { message: 'Unauthorized' })
        
        const { projectId } = c.req.valid('param')
        
        if (!projectId)
            throw new HTTPException(422, { message: 'Param projectId required' })
        
        const payload = ProjectUpdateSchema.parse(await c.req.json())
        
        const project = await projectsService.updateProject(user.id, projectId, payload)
        
        return c.json(project)
    } catch (error) {
        handleRouteError(error)
    }
}

export const deleteProject = async (c: ProjectContext) => {
    try {
        const user = c.get('user')
        
        if (!user)
            throw new HTTPException(401, { message: 'Unauthorized' })
        
        const { projectId } = c.req.valid('param')
        
        if (!projectId)
            throw new HTTPException(422, { message: 'Param projectId required' })
        
        await projectsService.deleteProject(user.id, projectId)
        
        return c.json({ success: true })
    } catch (error) {
        handleRouteError(error)
    }
}

const routes = new Hono<ApiAppEnv>()
    .get('/', projectQueryValidator, getProjects)
    .post('/', projectQueryValidator, createProject)
    .get('/:projectId', projectParamValidator, projectQueryValidator, getProjectById)
    .patch('/:projectId', projectParamValidator, projectQueryValidator, updateProject)
    .delete('/:projectId', projectParamValidator, projectQueryValidator, deleteProject)

export default routes
