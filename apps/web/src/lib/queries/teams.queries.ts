import type { Team, TeamMemberProfile } from '@repo/shared/types'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { request } from '@/lib/api/client'
import { useTeamStore } from '@/store'
import Logger from '@repo/shared/utils/logger'

const log = new Logger('web/lib/queries/teams.queries')

export const useGetTeamsQuery = (options = {}) => {
    
    const teamsQueryKey = useMemo(() => (
        ['teams'] as const
    ), [])
    
    // const { data: teams = initialTasks }
    const query = useQuery<Team[], Error>({
        queryKey: teamsQueryKey,
        queryFn: async () => {
            try {
                const res = await request<Team[]>('/teams')
                useTeamStore.getState().setTeams(res || [])
                
                return res || []
                
            } catch (e) {
                log.e('useGetTeamsQuery', e)
                return []
            }
        },
        // initialData: [],
        ...options,
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
    const query = useQuery<TeamMemberProfile[], Error>({
        queryKey: teamMembersQueryKey,
        queryFn: async () => {
            try {
                return await request<TeamMemberProfile[]>(`/teams/${teamId}/members`)
            } catch (e) {
                log.e('useGetTeamMembersQuery', e)
                return []
            }
        },
        // initialData: [],
    })
    
    return {
        ...query,
        teamMembersQueryKey,
    }
    
}

export const getTeamById = async (teamId: string): Promise<Team> => {
    return await request(`/teams/${teamId}`) as Team
}

export const getTeamMembers = async (teamId: string): Promise<TeamMemberProfile[]> => {
    return await request(`/teams/${teamId}/members`) as TeamMemberProfile[]
}

export const canManageTeamMembers = (teamId: string) => {
    
    log.e('!!!!!! @todo canManageTeamMembers', teamId)
    
    return true
    
}
