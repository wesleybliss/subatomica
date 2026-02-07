import logger from '@repo/shared/utils/logger'
import { Context } from 'hono'
import * as teamsService from '@/services/teams'
import * as projectsService from '@/services/projects'
import * as tasksService from '@/services/tasks'

const log = logger('routes/teams')

export const getTeams = async (c: Context) => {
    
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

export default (app: any) => {
  
    app.get('/', getTeams)
    app.get('/:teamId', getTeamById)
    app.get('/:teamId/members', getTeamMembers)
    app.get('/:teamId/tasks', getTeamTasks)
    
}
