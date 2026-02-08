import logger from '@repo/shared/utils/logger'
import { Context, Hono } from 'hono'
import * as teamsService from '@/services/teams'
import * as projectsService from '@/services/projects'
import * as tasksService from '@/services/tasks'
import { ApiAppEnv } from '@/env'
import { createTeam, getUserTeams } from '@/services/teams'

const log = logger('routes/teams')

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

export async function ensureUserHasTeam(userId: string) {
    
    const userTeams = await getUserTeams(userId)
    
    if (userTeams.length === 0)
        return createTeam('Personal', userId)
    
    return userTeams[0]
    
}

const routes = new Hono<ApiAppEnv>()
    .get('/', getTeams)
    .get('/:teamId', getTeamById)
    .get('/:teamId/members', getTeamMembers)
    .get('/:teamId/tasks', getTeamTasks)

export default routes
