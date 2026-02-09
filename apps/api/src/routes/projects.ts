import type { RouteHandler } from '@hono/zod-openapi'
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { HTTPException } from 'hono/http-exception'

import { ApiAppEnv } from '@/env'
import { ProjectSchema, ProjectWithLanesSchema } from '@/openapi/projects.zod'
import { ErrorSchema, SuccessSchema } from '@/openapi/shared.zod'
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
        200: {
            description: 'Projects list',
            content: {
                'application/json': {
                    schema: z.array(ProjectSchema),
                },
            },
        },
        401: {
            description: 'Unauthorized',
            content: {
                'application/json': { schema: ErrorSchema },
            },
        },
        500: {
            description: 'Server error',
            content: {
                'application/json': { schema: ErrorSchema },
            },
        },
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
        201: {
            description: 'Created project',
            content: {
                'application/json': {
                    schema: ProjectSchema,
                },
            },
        },
        400: {
            description: 'Invalid request',
            content: {
                'application/json': { schema: ErrorSchema },
            },
        },
        401: {
            description: 'Unauthorized',
            content: {
                'application/json': { schema: ErrorSchema },
            },
        },
        403: {
            description: 'Forbidden',
            content: {
                'application/json': { schema: ErrorSchema },
            },
        },
        404: {
            description: 'Not found',
            content: {
                'application/json': { schema: ErrorSchema },
            },
        },
        409: {
            description: 'Conflict',
            content: {
                'application/json': { schema: ErrorSchema },
            },
        },
        500: {
            description: 'Server error',
            content: {
                'application/json': { schema: ErrorSchema },
            },
        },
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
        200: {
            description: 'Project details',
            content: {
                'application/json': {
                    schema: ProjectWithLanesSchema,
                },
            },
        },
        401: {
            description: 'Unauthorized',
            content: {
                'application/json': { schema: ErrorSchema },
            },
        },
        404: {
            description: 'Not found',
            content: {
                'application/json': { schema: ErrorSchema },
            },
        },
        422: {
            description: 'Missing parameters',
            content: {
                'application/json': { schema: ErrorSchema },
            },
        },
        500: {
            description: 'Server error',
            content: {
                'application/json': { schema: ErrorSchema },
            },
        },
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
        200: {
            description: 'Updated project',
            content: {
                'application/json': {
                    schema: ProjectSchema,
                },
            },
        },
        400: {
            description: 'Invalid request',
            content: {
                'application/json': { schema: ErrorSchema },
            },
        },
        401: {
            description: 'Unauthorized',
            content: {
                'application/json': { schema: ErrorSchema },
            },
        },
        403: {
            description: 'Forbidden',
            content: {
                'application/json': { schema: ErrorSchema },
            },
        },
        404: {
            description: 'Not found',
            content: {
                'application/json': { schema: ErrorSchema },
            },
        },
        409: {
            description: 'Conflict',
            content: {
                'application/json': { schema: ErrorSchema },
            },
        },
        422: {
            description: 'Missing parameter',
            content: {
                'application/json': { schema: ErrorSchema },
            },
        },
        500: {
            description: 'Server error',
            content: {
                'application/json': { schema: ErrorSchema },
            },
        },
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
        200: {
            description: 'Deleted project',
            content: {
                'application/json': {
                    schema: SuccessSchema,
                },
            },
        },
        401: {
            description: 'Unauthorized',
            content: {
                'application/json': { schema: ErrorSchema },
            },
        },
        403: {
            description: 'Forbidden',
            content: {
                'application/json': { schema: ErrorSchema },
            },
        },
        404: {
            description: 'Not found',
            content: {
                'application/json': { schema: ErrorSchema },
            },
        },
        500: {
            description: 'Server error',
            content: {
                'application/json': { schema: ErrorSchema },
            },
        },
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
