import logger from '@repo/shared/utils/logger'
import { Context, Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { z } from 'zod'
import * as teamsService from '@/services/teams'
import * as projectsService from '@/services/projects'
import * as tasksService from '@/services/tasks'
import { ApiAppEnv } from '@/env'
import { createTeam, getUserTeams } from '@/services/teams'

const log = logger('routes/teams')

const TeamCreateSchema = z.object({
    name: z.string().min(1),
})

const TeamMemberAddSchema = z.object({
    email: z.string().email(),
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

export const getTeams = async (c: Context) => {
    
    log.d('getTeams', c.get('user'))
    
    const user = c.get('user')
    
    const teams = await teamsService.getUserTeams(user.id)
    
    return c.json(teams)
    
}

export const getTeamById = async (c: Context) => {
    
    const user = c.get('user')
    const teamId = c.req.param('teamId')
    
    const team = await teamsService.getTeamById(user.id, teamId)
    
    return c.json(team)
    
}

export const getTeamMembers = async (c: Context) => {
    
    const user = c.get('user')
    const teamId = c.req.param('teamId')
    
    const teamMembers = await teamsService.getTeamMembers(user.id, teamId)
    
    return c.json(teamMembers)
    
}

export const getTeamProjects = async (c: Context) => {
    
    const user = c.get('user')
    const teamId = c.req.param('teamId')
    
    const teamProjects = await projectsService.getProjects(user.id, teamId)
    
    return c.json(teamProjects)
    
}

export const getTeamTasks = async (c: Context) => {
    
    const user = c.get('user')
    const teamId = c.req.param('teamId')
    
    const teamTasks = await tasksService.getTasks(user.id, teamId)
    
    return c.json(teamTasks)
    
}

export const createTeamRoute = async (c: Context) => {
    try {
        const user = c.get('user')
        const payload = TeamCreateSchema.parse(await c.req.json())
        
        const team = await teamsService.createTeam(payload.name, user.id)
        
        return c.json(team, 201)
    } catch (error) {
        handleRouteError(error)
    }
}

export const addTeamMember = async (c: Context) => {
    try {
        const user = c.get('user')
        const teamId = c.req.param('teamId')
        const payload = TeamMemberAddSchema.parse(await c.req.json())
        
        const result = await teamsService.addTeamMember(teamId, user.id, payload.email)
        
        return c.json(result)
    } catch (error) {
        handleRouteError(error)
    }
}

export const removeTeamMember = async (c: Context) => {
    try {
        const user = c.get('user')
        const teamId = c.req.param('teamId')
        const targetUserId = c.req.param('userId')
        
        const result = await teamsService.removeTeamMember(teamId, user.id, targetUserId)
        
        return c.json(result)
    } catch (error) {
        handleRouteError(error)
    }
}

export async function ensureUserHasTeam(userId: string) {
    
    const userTeams = await getUserTeams(userId)
    
    if (userTeams.length === 0)
        return createTeam('Personal', userId)
    
    return userTeams[0]
    
}

const routes = new Hono<ApiAppEnv>()
    .get('/', getTeams)
    .post('/', createTeamRoute)
    .get('/:teamId', getTeamById)
    .get('/:teamId/members', getTeamMembers)
    .post('/:teamId/members', addTeamMember)
    .delete('/:teamId/members/:userId', removeTeamMember)
    .get('/:teamId/tasks', getTeamTasks)

export default routes
