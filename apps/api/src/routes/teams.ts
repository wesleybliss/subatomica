import logger from '@repo/shared/utils/logger'
import { Context } from 'hono'
import * as teamsService from '@/services/teams'

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

export default (app: any) => {
  
    app.get('/t', getTeams)
    app.get('/t/:teamId', getTeamById)
    app.get('/t/:teamId/members', getTeamMembers)
    
}
