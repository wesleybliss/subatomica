import type { Team, TeamMemberProfile } from '@repo/shared/types'
import { request } from '@/lib/api/client'
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

export const useGetTeamsQuery = () => {
    
    const teamsQueryKey = useMemo(() => (
        ['teams'] as const
    ), [])
    
    // const { data: teams = initialTasks }
    const query = useQuery({
        queryKey: teamsQueryKey,
        queryFn: async () => {
            try {
                return await request('/teams') as Promise<Team[]>
            } catch (e) {
                console.error('useGetTeamsQuery', e)
                return null
            }
        },
        // initialData: [],
    })
    
    return {
        ...query,
        teamsQueryKey,
    }
    
}

export const useGetTeamMembersQuery = (teamId: string) => {
    
    const teamMembersQueryKey = useMemo(() => (
        ['teamMembers', teamId] as const
    ), [teamId])
    
    // const { data: teamMembers = initialTasks }
    const query = useQuery({
        queryKey: teamMembersQueryKey,
        queryFn: async () => {
            try {
                return await request(`/teams/${teamId}/members`) as Promise<TeamMemberProfile[]>
            } catch (e) {
                console.error('useGetTeamMembersQuery', e)
                return null
            }
        },
        // initialData: [],
    })
    
    return {
        ...query,
        teamMembersQueryKey,
    }
    
}

export const getUserTeams = async (): Promise<Team[]> => {
    return await request('/teams') as Team[]
}

export const getTeamById = async (teamId: string): Promise<Team> => {
    return await request(`/teams/${teamId}`) as Team
}

export const getTeamMembers = async (teamId: string): Promise<TeamMemberProfile[]> => {
    return await request(`/teams/${teamId}/members`) as TeamMemberProfile[]
}

export const canManageTeamMembers = (teamId: string) => {
    
    console.warn('!!!!!! @todo canManageTeamMembers')
    
    return true
    
}
