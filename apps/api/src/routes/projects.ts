import type { RouteHandler } from '@hono/zod-openapi'
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { ProjectSchema, ProjectWithLanesSchema, SuccessSchema } from '@repo/db/openapi'
import { HTTPException } from 'hono/http-exception'

import { ApiAppEnv } from '@/env'
import { createResponses } from '@/openapi/responses'
import * as projectsService from '@/services/projects'

const ProjectParamSchema = z.object({
    projectId: z.string().openapi({
        param: { name: 'projectId', in: 'path' },
        example: '019c416f-d018-721f-b332-e9424030c6a8',
    }),
})

const ProjectQuerySchema = z.object({
    teamId: z.string().openapi({
        param: { name: 'teamId', in: 'query' },
        example: '019c416f-d018-721f-b332-e9424030c6a8',
    }),
})

const ProjectCreateSchema = z
    .object({
        name: z.string().min(1).openapi({
            example: 'Sub-Atomica',
        }),
    })
    .openapi('ProjectCreate')

const ProjectUpdateSchema = z
    .object({
        name: z.string().min(1).optional().openapi({
            example: 'Sub-Atomica',
        }),
    })
    .refine(payload => Object.keys(payload).length > 0, {
        message: 'At least one update field is required',
    })
    .openapi('ProjectUpdate')

const getProjectsRoute = createRoute({
    method: 'get',
    path: '/',
    tags: ['Projects'],
    security: [{ bearerAuth: [] }],
    request: {
        query: ProjectQuerySchema,
    },
    responses: {
        ...createResponses(z.array(ProjectSchema), {
            successDescription: 'Projects list',
            errorStatuses: [401, 500],
        }),
    },
})

const createProjectRoute = createRoute({
    method: 'post',
    path: '/',
    tags: ['Projects'],
    security: [{ bearerAuth: [] }],
    request: {
        query: ProjectQuerySchema,
        body: {
            content: {
                'application/json': {
                    schema: ProjectCreateSchema,
                },
            },
        },
    },
    responses: {
        ...createResponses(ProjectSchema, {
            successStatus: 201,
            successDescription: 'Created project',
            errorStatuses: [400, 401, 403, 404, 409, 500],
        }),
    },
})

const getProjectByIdRoute = createRoute({
    method: 'get',
    path: '/{projectId}',
    tags: ['Projects'],
    security: [{ bearerAuth: [] }],
    request: {
        params: ProjectParamSchema,
        query: ProjectQuerySchema,
    },
    responses: {
        ...createResponses(ProjectWithLanesSchema, {
            successDescription: 'Project details',
            errorStatuses: [401, 404, 422, 500],
            errorDescriptions: {
                422: 'Missing parameters',
            },
        }),
    },
})

const updateProjectRoute = createRoute({
    method: 'patch',
    path: '/{projectId}',
    tags: ['Projects'],
    security: [{ bearerAuth: [] }],
    request: {
        params: ProjectParamSchema,
        query: ProjectQuerySchema,
        body: {
            content: {
                'application/json': {
                    schema: ProjectUpdateSchema,
                },
            },
        },
    },
    responses: {
        ...createResponses(ProjectSchema, {
            successDescription: 'Updated project',
            errorStatuses: [400, 401, 403, 404, 409, 422, 500],
        }),
    },
})

const deleteProjectRoute = createRoute({
    method: 'delete',
    path: '/{projectId}',
    tags: ['Projects'],
    security: [{ bearerAuth: [] }],
    request: {
        params: ProjectParamSchema,
        query: ProjectQuerySchema,
    },
    responses: {
        ...createResponses(SuccessSchema, {
            successDescription: 'Deleted project',
            errorStatuses: [401, 403, 404, 500],
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

const getProjects: RouteHandler<typeof getProjectsRoute, ApiAppEnv> = async c => {
    const user = c.get('user')
    
    if (!user)
        throw new HTTPException(401, { message: 'Unauthorized' })
    
    const { teamId } = c.req.valid('query')
    
    const projects = await projectsService.getProjects(user.id, teamId)
    
    return c.json(projects, 200)
}

const getProjectById: RouteHandler<typeof getProjectByIdRoute, ApiAppEnv> = async c => {
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
    
    return c.json(project, 200)
}

const createProject: RouteHandler<typeof createProjectRoute, ApiAppEnv> = async c => {
    try {
        const user = c.get('user')
        
        if (!user)
            throw new HTTPException(401, { message: 'Unauthorized' })
        
        const { teamId } = c.req.valid('query')
        const payload = c.req.valid('json')
        
        const project = await projectsService.createProject(user.id, teamId, payload.name)
        
        return c.json(project, 201)
    } catch (error) {
        return handleRouteError(error)
    }
}

const updateProject: RouteHandler<typeof updateProjectRoute, ApiAppEnv> = async c => {
    try {
        const user = c.get('user')
        
        if (!user)
            throw new HTTPException(401, { message: 'Unauthorized' })
        
        const { projectId } = c.req.valid('param')
        
        if (!projectId)
            throw new HTTPException(422, { message: 'Param projectId required' })
        
        const payload = c.req.valid('json')
        
        const project = await projectsService.updateProject(user.id, projectId, payload)
        
        return c.json(project, 200)
    } catch (error) {
        return handleRouteError(error)
    }
}

const deleteProject: RouteHandler<typeof deleteProjectRoute, ApiAppEnv> = async c => {
    try {
        const user = c.get('user')
        
        if (!user)
            throw new HTTPException(401, { message: 'Unauthorized' })
        
        const { projectId } = c.req.valid('param')
        
        if (!projectId)
            throw new HTTPException(422, { message: 'Param projectId required' })
        
        await projectsService.deleteProject(user.id, projectId)
        
        return c.json({ success: true }, 200)
    } catch (error) {
        return handleRouteError(error)
    }
}

const routes = new OpenAPIHono<ApiAppEnv>()
    .openapi(getProjectsRoute, getProjects)
    .openapi(createProjectRoute, createProject)
    .openapi(getProjectByIdRoute, getProjectById)
    .openapi(updateProjectRoute, updateProject)
    .openapi(deleteProjectRoute, deleteProject)

export default routes
