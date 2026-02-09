import logger from '@repo/shared/utils/logger'
import { HTTPException } from 'hono/http-exception'
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import type { RouteHandler } from '@hono/zod-openapi'
import * as teamsService from '@/services/teams'
import * as projectsService from '@/services/projects'
import * as tasksService from '@/services/tasks'
import { ApiAppEnv } from '@/env'
import { TeamMemberSchema, TeamSchema } from '@/openapi/teams.zod'
import { ProjectSchema } from '@/openapi/projects.zod'
import { TaskSchema } from '@/openapi/tasks.zod'
import { ErrorSchema, SuccessSchema } from '@/openapi/shared.zod'

const log = logger('routes/teams')

const TeamIdParamSchema = z.object({
    teamId: z.string().openapi({
        param: { name: 'teamId', in: 'path' },
        example: '019c416f-d018-721f-b332-e9424030c6a8',
    }),
})

const TeamMemberParamSchema = TeamIdParamSchema.extend({
    userId: z.string().openapi({
        param: { name: 'userId', in: 'path' },
        example: '019c416f-d018-721f-b332-e9424030c6a8',
    }),
})

const TeamCreateSchema = z
    .object({
        name: z.string().min(1).openapi({
            example: 'Personal',
        }),
    })
    .openapi('TeamCreate')

const TeamMemberAddSchema = z
    .object({
        email: z.string().email().openapi({
            example: 'john.doe@gmail.com',
        }),
    })
    .openapi('TeamMemberAdd')

const getTeamsRoute = createRoute({
    method: 'get',
    path: '/',
    tags: ['Teams'],
    security: [{ bearerAuth: [] }],
    responses: {
        200: {
            description: 'List teams for the current user',
            content: {
                'application/json': {
                    schema: z.array(TeamSchema),
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

const createTeamOpenApi = createRoute({
    method: 'post',
    path: '/',
    tags: ['Teams'],
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: TeamCreateSchema,
                },
            },
        },
    },
    responses: {
        201: {
            description: 'Created team',
            content: {
                'application/json': {
                    schema: TeamSchema,
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

const getTeamByIdRoute = createRoute({
    method: 'get',
    path: '/{teamId}',
    tags: ['Teams'],
    security: [{ bearerAuth: [] }],
    request: {
        params: TeamIdParamSchema,
    },
    responses: {
        200: {
            description: 'Team details',
            content: {
                'application/json': {
                    schema: TeamSchema,
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
        500: {
            description: 'Server error',
            content: {
                'application/json': { schema: ErrorSchema },
            },
        },
    },
})

const getTeamMembersRoute = createRoute({
    method: 'get',
    path: '/{teamId}/members',
    tags: ['Teams'],
    security: [{ bearerAuth: [] }],
    request: {
        params: TeamIdParamSchema,
    },
    responses: {
        200: {
            description: 'Team members',
            content: {
                'application/json': {
                    schema: z.array(TeamMemberSchema),
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

const addTeamMemberRoute = createRoute({
    method: 'post',
    path: '/{teamId}/members',
    tags: ['Teams'],
    security: [{ bearerAuth: [] }],
    request: {
        params: TeamIdParamSchema,
        body: {
            content: {
                'application/json': {
                    schema: TeamMemberAddSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Member added',
            content: {
                'application/json': {
                    schema: SuccessSchema,
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

const removeTeamMemberRoute = createRoute({
    method: 'delete',
    path: '/{teamId}/members/{userId}',
    tags: ['Teams'],
    security: [{ bearerAuth: [] }],
    request: {
        params: TeamMemberParamSchema,
    },
    responses: {
        200: {
            description: 'Member removed',
            content: {
                'application/json': {
                    schema: SuccessSchema,
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

const getTeamProjectsRoute = createRoute({
    method: 'get',
    path: '/{teamId}/projects',
    tags: ['Teams'],
    security: [{ bearerAuth: [] }],
    request: {
        params: TeamIdParamSchema,
    },
    responses: {
        200: {
            description: 'Team projects',
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

const getTeamTasksRoute = createRoute({
    method: 'get',
    path: '/{teamId}/tasks',
    tags: ['Teams'],
    security: [{ bearerAuth: [] }],
    request: {
        params: TeamIdParamSchema,
    },
    responses: {
        200: {
            description: 'Team tasks',
            content: {
                'application/json': {
                    schema: z.array(TaskSchema),
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

const getTeams: RouteHandler<typeof getTeamsRoute, ApiAppEnv> = async c => {
    log.d('getTeams', c.get('user'))
    
    const user = c.get('user')
    
    if (!user)
        throw new HTTPException(401, { message: 'Unauthorized' })
    
    const teams = await teamsService.getUserTeams(user.id)
    
    return c.json(teams, 200)
}

const getTeamById: RouteHandler<typeof getTeamByIdRoute, ApiAppEnv> = async c => {
    const user = c.get('user')
    
    if (!user)
        throw new HTTPException(401, { message: 'Unauthorized' })
    
    const { teamId } = c.req.valid('param')
    
    const team = await teamsService.getTeamById(user.id, teamId)
    
    return c.json(team, 200)
}

const getTeamMembers: RouteHandler<typeof getTeamMembersRoute, ApiAppEnv> = async c => {
    const user = c.get('user')
    
    if (!user)
        throw new HTTPException(401, { message: 'Unauthorized' })
    
    const { teamId } = c.req.valid('param')
    
    const teamMembers = await teamsService.getTeamMembers(user.id, teamId)
    
    return c.json(teamMembers, 200)
}

const getTeamProjects: RouteHandler<typeof getTeamProjectsRoute, ApiAppEnv> = async c => {
    const user = c.get('user')
    
    if (!user)
        throw new HTTPException(401, { message: 'Unauthorized' })
    
    const { teamId } = c.req.valid('param')
    
    const teamProjects = await projectsService.getProjects(user.id, teamId)
    
    return c.json(teamProjects, 200)
}

const getTeamTasks: RouteHandler<typeof getTeamTasksRoute, ApiAppEnv> = async c => {
    const user = c.get('user')
    
    if (!user)
        throw new HTTPException(401, { message: 'Unauthorized' })
    
    const { teamId } = c.req.valid('param')
    
    const teamTasks = await tasksService.getTasks(user.id, teamId)
    
    return c.json(teamTasks, 200)
}

const createTeamHandler: RouteHandler<typeof createTeamOpenApi, ApiAppEnv> = async c => {
    try {
        const user = c.get('user')
        
        if (!user)
            throw new HTTPException(401, { message: 'Unauthorized' })
        
        const payload = c.req.valid('json')
        
        const team = await teamsService.createTeam(payload.name, user.id)
        
        return c.json(team, 201)
    } catch (error) {
        return handleRouteError(error)
    }
}

const addTeamMemberHandler: RouteHandler<typeof addTeamMemberRoute, ApiAppEnv> = async c => {
    try {
        const user = c.get('user')
        
        if (!user)
            throw new HTTPException(401, { message: 'Unauthorized' })
        
        const { teamId } = c.req.valid('param')
        const payload = c.req.valid('json')
        
        const result = await teamsService.addTeamMember(teamId, user.id, payload.email)
        
        return c.json(result, 200)
    } catch (error) {
        return handleRouteError(error)
    }
}

const removeTeamMemberHandler: RouteHandler<typeof removeTeamMemberRoute, ApiAppEnv> = async c => {
    try {
        const user = c.get('user')
        
        if (!user)
            throw new HTTPException(401, { message: 'Unauthorized' })
        
        const { teamId, userId } = c.req.valid('param')
        
        if (!userId)
            throw new HTTPException(422, { message: 'Param userId required' })
        
        const result = await teamsService.removeTeamMember(teamId, user.id, userId)
        
        return c.json(result, 200)
    } catch (error) {
        return handleRouteError(error)
    }
}

export async function ensureUserHasTeam(userId: string) {
    const userTeams = await teamsService.getUserTeams(userId)
    
    if (userTeams.length === 0)
        return teamsService.createTeam('Personal', userId)
    
    return userTeams[0]
}

const routes = new OpenAPIHono<ApiAppEnv>()
    .openapi(getTeamsRoute, getTeams)
    .openapi(createTeamOpenApi, createTeamHandler)
    .openapi(getTeamByIdRoute, getTeamById)
    .openapi(getTeamMembersRoute, getTeamMembers)
    .openapi(addTeamMemberRoute, addTeamMemberHandler)
    .openapi(removeTeamMemberRoute, removeTeamMemberHandler)
    .openapi(getTeamProjectsRoute, getTeamProjects)
    .openapi(getTeamTasksRoute, getTeamTasks)

export default routes
