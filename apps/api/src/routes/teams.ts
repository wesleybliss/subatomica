import type { RouteHandler } from '@hono/zod-openapi'
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { ProjectSchema, SuccessSchema, TaskSchema, TeamMemberSchema, TeamSchema } from '@repo/db/openapi'
import logger from '@repo/shared/utils/logger'
import { HTTPException } from 'hono/http-exception'

import { ApiAppEnv } from '@/env'
import { createResponses } from '@/openapi/responses'
import * as projectsService from '@/services/projects'
import * as tasksService from '@/services/tasks'
import * as teamsService from '@/services/teams'

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
        ...createResponses(z.array(TeamSchema), {
            successDescription: 'List teams for the current user',
            errorStatuses: [401, 500],
        }),
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
        ...createResponses(TeamSchema, {
            successStatus: 201,
            successDescription: 'Created team',
            errorStatuses: [400, 401, 403, 409, 500],
        }),
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
        ...createResponses(TeamSchema, {
            successDescription: 'Team details',
            errorStatuses: [401, 404, 500],
        }),
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
        ...createResponses(z.array(TeamMemberSchema), {
            successDescription: 'Team members',
            errorStatuses: [401, 500],
        }),
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
        ...createResponses(SuccessSchema, {
            successDescription: 'Member added',
            errorStatuses: [400, 401, 403, 404, 409, 500],
        }),
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
        ...createResponses(SuccessSchema, {
            successDescription: 'Member removed',
            errorStatuses: [400, 401, 403, 404, 409, 422, 500],
        }),
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
        ...createResponses(z.array(ProjectSchema), {
            successDescription: 'Team projects',
            errorStatuses: [401, 500],
        }),
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
        ...createResponses(z.array(TaskSchema), {
            successDescription: 'Team tasks',
            errorStatuses: [401, 500],
        }),
    },
})

const updateTeamRoute = createRoute({
    method: 'patch',
    path: '/{teamId}',
    tags: ['Teams'],
    security: [{ bearerAuth: [] }],
    request: {
        params: TeamIdParamSchema,
        body: {
            content: {
                'application/json': {
                    schema: TeamCreateSchema,
                },
            },
        },
    },
    responses: {
        ...createResponses(TeamSchema, {
            successDescription: 'Team updated',
            errorStatuses: [400, 401, 403, 404, 500],
        }),
    },
})

const deleteTeamRoute = createRoute({
    method: 'delete',
    path: '/{teamId}',
    tags: ['Teams'],
    security: [{ bearerAuth: [] }],
    request: {
        params: TeamIdParamSchema,
    },
    responses: {
        ...createResponses(SuccessSchema, {
            successDescription: 'Team deleted',
            errorStatuses: [400, 401, 403, 404, 500],
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

const updateTeamHandler: RouteHandler<typeof updateTeamRoute, ApiAppEnv> = async c => {
    try {
        const user = c.get('user')
        
        if (!user)
            throw new HTTPException(401, { message: 'Unauthorized' })
        
        const { teamId } = c.req.valid('param')
        const payload = c.req.valid('json')
        
        const team = await teamsService.renameTeam(user.id, teamId, payload.name)
        
        return c.json(team, 200)
    } catch (error) {
        return handleRouteError(error)
    }
}

const deleteTeamHandler: RouteHandler<typeof deleteTeamRoute, ApiAppEnv> = async c => {
    try {
        const user = c.get('user')
        
        if (!user)
            throw new HTTPException(401, { message: 'Unauthorized' })
        
        const { teamId } = c.req.valid('param')
        
        await teamsService.deleteTeam(user.id, teamId)
        
        return c.json({ success: true }, 200)
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
    .openapi(updateTeamRoute, updateTeamHandler)
    .openapi(deleteTeamRoute, deleteTeamHandler)

export default routes
