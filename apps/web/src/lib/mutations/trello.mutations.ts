import { useMutation, useQueryClient } from '@tanstack/react-query'

import { request } from '@/lib/api/client'
import { trelloCatalogQueryKey, trelloStatusQueryKey } from '@/lib/queries/trello.queries'

export type TrelloImportBody = {
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
}

export function useTrelloAuthorizeMutation() {
    return useMutation({
        mutationFn: async (returnTeamSlug?: string) => {
            const qs = returnTeamSlug
                ? `?returnTeamSlug=${encodeURIComponent(returnTeamSlug)}`
                : ''
            return request<{ url: string }>(`/integrations/trello/authorize${qs}`)
        },
    })
}

export function useTrelloDisconnectMutation() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async () =>
            request<{ ok: boolean }>('/integrations/trello/connection', { method: 'DELETE' }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: trelloStatusQueryKey })
            await queryClient.invalidateQueries({ queryKey: trelloCatalogQueryKey })
        },
    })
}

export function useTrelloImportMutation() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (body: TrelloImportBody) =>
            request<{ results: Array<Record<string, unknown>> }>('/integrations/trello/import', {
                method: 'POST',
                body: JSON.stringify(body),
            }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: trelloCatalogQueryKey })
            await queryClient.invalidateQueries({ queryKey: ['projects'] })
            await queryClient.invalidateQueries({ queryKey: ['teams'] })
        },
    })
}

export function useTrelloSyncMutation() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ boardLinkId, syncEnabled }: { boardLinkId: string, syncEnabled: boolean }) =>
            request(`/integrations/trello/boards/${boardLinkId}/sync`, {
                method: 'POST',
                body: JSON.stringify({ syncEnabled }),
            }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: trelloCatalogQueryKey })
        },
    })
}

export function useTrelloResyncMutation() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (boardLinkId: string) =>
            request(`/integrations/trello/boards/${boardLinkId}/resync`, {
                method: 'POST',
            }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: trelloCatalogQueryKey })
            await queryClient.invalidateQueries({ queryKey: ['tasks'] })
        },
    })
}
