import type { Team, TeamMemberProfile } from '@repo/shared/types'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { request } from '@/lib/api/client'
import * as store from '@/store'

export const useGetTeamsQuery = () => {
    
    const teamsQueryKey = useMemo(() => (
        ['teams'] as const
    ), [])
    
    // const { data: teams = initialTasks }
    const query = useQuery<Team[], Error>({
        queryKey: teamsQueryKey,
        queryFn: async () => {
            try {
                const res = await request<Team[]>('/teams')
                
                store.teams.setValue(res || [])
                
                return res || []
                
            } catch (e) {
                console.error('useGetTeamsQuery', e)
                return []
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
    const query = useQuery<TeamMemberProfile[], Error>({
        queryKey: teamMembersQueryKey,
        queryFn: async () => {
            try {
                return await request<TeamMemberProfile[]>(`/teams/${teamId}/members`)
            } catch (e) {
                console.error('useGetTeamMembersQuery', e)
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
    
    console.warn('!!!!!! @todo canManageTeamMembers', teamId)
    
    return true
    
}
