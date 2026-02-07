import type { Team, TeamMemberProfile } from '@repo/shared/types'
import { request } from '@/lib/api/client'

export const getUserTeams = async (): Promise<Team[]> => {
    return await request(`/api/teams`) as Team[]
}

export const getTeamById = async (teamId: string): Promise<Team> => {
    return await request(`/api/teams/${teamId}`) as Team
}

export const getTeamMembers = async (teamId: string): Promise<TeamMemberProfile[]> => {
    return await request(`/api/teams/${teamId}/members`) as TeamMemberProfile[]
}

export const canManageTeamMembers = (teamId: string) => {
    
    console.warn('!!!!!! @todo canManageTeamMembers')
    
    return true
    
}
