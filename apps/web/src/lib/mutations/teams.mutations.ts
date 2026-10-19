import { Team } from '@repo/shared/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { request } from '@/lib/api/client'
import { useTeamStore } from '@/store'

const teamsQueryKey = ['teams'] as const

interface TeamContext {
    previousTeams?: Team[]
}

export const useCreateTeamMutation = () => {
    const queryClient = useQueryClient()

    return useMutation<Team, Error, { name: string }, TeamContext>({
        mutationFn: async ({ name }) => {
            if (!name.trim()) throw new Error('Team name is required')
            return await request<Team>('/teams', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim() }),
            })
        },
        onMutate: async ({ name }) => {
            await queryClient.cancelQueries({ queryKey: teamsQueryKey })
            const previousTeams = queryClient.getQueryData<Team[]>(teamsQueryKey)
            const tempTeam: Team = {
                id: `temp-${Date.now()}`,
                name: name.trim(),
                slug: name.trim().toLowerCase().replace(/\s+/g, '-'),
                ownerId: 'pending',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }
            const nextTeams = [...(previousTeams || useTeamStore.getState().teams || []), tempTeam]
            queryClient.setQueryData(teamsQueryKey, nextTeams)
            useTeamStore.getState().setTeams(nextTeams)
            return { previousTeams }
        },
        onError: (_error, _vars, context) => {
            if (context?.previousTeams) {
                queryClient.setQueryData(teamsQueryKey, context.previousTeams)
                useTeamStore.getState().setTeams(context.previousTeams)
            }
        },
        onSuccess: (created) => {
            queryClient.setQueryData(teamsQueryKey, (current?: Team[]) => {
                const teams = current || []
                const filtered = teams.filter(t => !t.id.startsWith('temp-'))
                return [...filtered, created]
            })
            const currentStoreTeams = useTeamStore.getState().teams || []
            const filtered = currentStoreTeams.filter(t => !t.id.startsWith('temp-'))
            useTeamStore.getState().setTeams([...filtered, created])
        },
    })
}

export const useUpdateTeamMutation = () => {
    const queryClient = useQueryClient()

    return useMutation<Team, Error, { teamId: string; name: string }, TeamContext>({
        mutationFn: async ({ teamId, name }) => {
            if (!name.trim()) throw new Error('Team name is required')
            return await request<Team>(`/teams/${teamId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim() }),
            })
        },
        onMutate: async ({ teamId, name }) => {
            await queryClient.cancelQueries({ queryKey: teamsQueryKey })
            const previousTeams = queryClient.getQueryData<Team[]>(teamsQueryKey)
            const nextTeams = (previousTeams || useTeamStore.getState().teams || []).map(team =>
                team.id === teamId
                    ? { ...team, name: name.trim(), slug: name.trim().toLowerCase().replace(/\s+/g, '-') }
                    : team
            )
            queryClient.setQueryData(teamsQueryKey, nextTeams)
            useTeamStore.getState().setTeams(nextTeams)
            return { previousTeams }
        },
        onError: (_error, _vars, context) => {
            if (context?.previousTeams) {
                queryClient.setQueryData(teamsQueryKey, context.previousTeams)
                useTeamStore.getState().setTeams(context.previousTeams)
            }
        },
        onSuccess: (updated) => {
            queryClient.setQueryData(teamsQueryKey, (current?: Team[]) => {
                const teams = current || []
                return teams.map(team => (team.id === updated.id ? updated : team))
            })
            const currentStoreTeams = useTeamStore.getState().teams || []
            useTeamStore.getState().setTeams(currentStoreTeams.map(team => (team.id === updated.id ? updated : team)))
        },
    })
}

export const useDeleteTeamMutation = () => {
    const queryClient = useQueryClient()

    return useMutation<void, Error, { teamId: string }, TeamContext>({
        mutationFn: async ({ teamId }) => {
            await request(`/teams/${teamId}`, {
                method: 'DELETE',
            })
        },
        onMutate: async ({ teamId }) => {
            await queryClient.cancelQueries({ queryKey: teamsQueryKey })
            const previousTeams = queryClient.getQueryData<Team[]>(teamsQueryKey)
            const nextTeams = (previousTeams || useTeamStore.getState().teams || []).filter(team => team.id !== teamId)
            queryClient.setQueryData(teamsQueryKey, nextTeams)
            useTeamStore.getState().setTeams(nextTeams)
            return { previousTeams }
        },
        onError: (_error, _vars, context) => {
            if (context?.previousTeams) {
                queryClient.setQueryData(teamsQueryKey, context.previousTeams)
                useTeamStore.getState().setTeams(context.previousTeams)
            }
        },
        onSuccess: (_data, { teamId }) => {
            queryClient.setQueryData(teamsQueryKey, (current?: Team[]) => {
                const teams = current || []
                return teams.filter(team => team.id !== teamId)
            })
            const currentStoreTeams = useTeamStore.getState().teams || []
            useTeamStore.getState().setTeams(currentStoreTeams.filter(team => team.id !== teamId))
        },
    })
}
