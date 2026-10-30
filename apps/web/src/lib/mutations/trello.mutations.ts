import { useMutation, useQueryClient } from '@tanstack/react-query'

import { request } from '@/lib/api/client'
import {
    trelloCatalogQueryKey,
    trelloStatusQueryKey,
} from '@/lib/queries/trello.queries'

export type TrelloMemberMapping = {
    trelloMemberId: string
    email: string
    trelloUsername?: string | null
    trelloFullName?: string | null
}

export type TrelloImportBody = {
    teamId: string
    workspaceMappings: Array<{
        trelloWorkspaceId: string
        trelloWorkspaceName: string
        teamId?: string | null
        createTeamName?: string
    }>
    boardMappings: Array<{
        trelloBoardId: string
        teamId?: string
        projectId?: string | null
        createProjectName?: string
        syncEnabled?: boolean
    }>
    memberMappings?: TrelloMemberMapping[]
}

export function useTrelloAuthorizeMutation() {
    return useMutation({
        mutationFn: async ({ teamId, returnTeamSlug }: { teamId: string, returnTeamSlug?: string }) => {
            const params = new URLSearchParams({ teamId })
            if (returnTeamSlug)
                params.set('returnTeamSlug', returnTeamSlug)
            return request<{ url: string }>(`/integrations/trello/authorize?${params}`)
        },
    })
}

export function useTrelloDisconnectMutation(teamId: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async () =>
            request<{ ok: boolean }>(
                `/integrations/trello/connection?teamId=${encodeURIComponent(teamId)}`,
                { method: 'DELETE' },
            ),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: trelloStatusQueryKey(teamId) })
            await queryClient.invalidateQueries({ queryKey: trelloCatalogQueryKey(teamId) })
        },
    })
}

export function useTrelloImportMutation(teamId: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (body: TrelloImportBody) =>
            request<{ results: Array<Record<string, unknown>> }>('/integrations/trello/import', {
                method: 'POST',
                body: JSON.stringify(body),
            }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: trelloCatalogQueryKey(teamId) })
            await queryClient.invalidateQueries({ queryKey: ['trello', 'members', teamId] })
            await queryClient.invalidateQueries({ queryKey: ['projects'] })
            await queryClient.invalidateQueries({ queryKey: ['teams'] })
            await queryClient.invalidateQueries({ queryKey: ['teamMembers'] })
        },
    })
}

export function useTrelloMemberMappingsMutation(teamId: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (mappings: TrelloMemberMapping[]) =>
            request<{ created: number, linked: number }>(
                '/integrations/trello/member-mappings',
                {
                    method: 'POST',
                    body: JSON.stringify({ teamId, mappings }),
                },
            ),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['trello', 'members', teamId] })
            await queryClient.invalidateQueries({ queryKey: ['teamMembers'] })
        },
    })
}

export function useTrelloSyncMutation(teamId: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ boardLinkId, syncEnabled }: { boardLinkId: string, syncEnabled: boolean }) =>
            request(`/integrations/trello/boards/${boardLinkId}/sync`, {
                method: 'POST',
                body: JSON.stringify({ syncEnabled }),
            }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: trelloCatalogQueryKey(teamId) })
        },
    })
}

export function useTrelloResyncMutation(teamId: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (boardLinkId: string) =>
            request(`/integrations/trello/boards/${boardLinkId}/resync`, {
                method: 'POST',
            }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: trelloCatalogQueryKey(teamId) })
            await queryClient.invalidateQueries({ queryKey: ['tasks'] })
        },
    })
}
