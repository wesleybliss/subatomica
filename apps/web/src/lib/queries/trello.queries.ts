import { useQuery } from '@tanstack/react-query'

import { request } from '@/lib/api/client'

export type TrelloStatus = {
    configured: boolean
    connected: boolean
    connection: {
        id: string
        trelloMemberId: string
        trelloUsername: string | null
        createdAt: string
    } | null
}

export type TrelloCatalog = {
    workspaces: Array<{
        id: string
        name: string
        isPersonal: boolean
        boardCount: number
    }>
    boards: Array<{
        id: string
        name: string
        desc: string
        url: string
        trelloWorkspaceId: string
        existingLink: {
            id: string
            projectId: string
            teamId: string
            syncEnabled: boolean
            lastSyncedAt: string | null
        } | null
    }>
    workspaceLinks: Array<{
        id: string
        trelloWorkspaceId: string
        trelloWorkspaceName: string
        teamId: string
    }>
    boardLinks: Array<{
        id: string
        trelloBoardId: string
        trelloBoardName: string
        projectId: string
        teamId: string
        syncEnabled: boolean
        lastSyncedAt: string | null
    }>
    teams: Array<{
        id: string
        name: string
        slug: string
    }>
}

export const trelloStatusQueryKey = ['trello', 'status'] as const
export const trelloCatalogQueryKey = ['trello', 'catalog'] as const

export function useTrelloStatusQuery() {
    return useQuery({
        queryKey: trelloStatusQueryKey,
        queryFn: () => request<TrelloStatus>('/integrations/trello/status'),
    })
}

export function useTrelloCatalogQuery(enabled: boolean) {
    return useQuery({
        queryKey: trelloCatalogQueryKey,
        queryFn: () => request<TrelloCatalog>('/integrations/trello/catalog'),
        enabled,
    })
}
