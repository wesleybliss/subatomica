'use client'

import { useQueryClient } from '@tanstack/react-query'
import { Check, Loader2, RefreshCw, Unplug } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
    useTrelloAuthorizeMutation,
    useTrelloDisconnectMutation,
    useTrelloImportMutation,
    useTrelloResyncMutation,
    useTrelloSyncMutation,
} from '@/lib/mutations/trello.mutations'
import { useGetProjectsQuery } from '@/lib/queries/projects.queries'
import {
    trelloStatusQueryKey,
    useTrelloCatalogQuery,
    useTrelloStatusQuery,
} from '@/lib/queries/trello.queries'
import { useProjectStore } from '@/store'

type WorkspaceChoice = {
    mode: 'existing' | 'create'
    teamId: string
    createTeamName: string
}

type BoardChoice = {
    selected: boolean
    mode: 'create' | 'existing'
    projectId: string
    createProjectName: string
    syncEnabled: boolean
}

const CREATE_VALUE = '__create__'

type TrelloImportSectionProps = {
    teamId: string
    teamSlug: string
    teamName: string
}

export function TrelloImportSection({ teamId, teamSlug, teamName }: TrelloImportSectionProps) {
    const [searchParams, setSearchParams] = useSearchParams()
    const queryClient = useQueryClient()
    const statusQuery = useTrelloStatusQuery()
    const catalogQuery = useTrelloCatalogQuery(Boolean(statusQuery.data?.connected))
    const authorize = useTrelloAuthorizeMutation()
    const disconnect = useTrelloDisconnectMutation()
    const runImport = useTrelloImportMutation()
    const setSync = useTrelloSyncMutation()
    const resync = useTrelloResyncMutation()

    useGetProjectsQuery(teamId)
    const projects = useProjectStore(s => s.projects)

    const [workspaceChoices, setWorkspaceChoices] = useState<Record<string, WorkspaceChoice>>({})
    const [boardChoices, setBoardChoices] = useState<Record<string, BoardChoice>>({})

    const trelloFlag = searchParams.get('trello')

    useEffect(() => {
        if (!trelloFlag) return
        if (trelloFlag === 'connected')
            toast.success('Trello connected')
        if (trelloFlag === 'error')
            toast.error('Trello connection failed')
        const next = new URLSearchParams(searchParams)
        next.delete('trello')
        setSearchParams(next, { replace: true })
        void queryClient.invalidateQueries({ queryKey: trelloStatusQueryKey })
    }, [trelloFlag, searchParams, setSearchParams, queryClient])

    useEffect(() => {
        if (!catalogQuery.data) return

        setWorkspaceChoices(prev => {
            const next = { ...prev }
            for (const ws of catalogQuery.data.workspaces) {
                if (next[ws.id]) continue
                const existing = catalogQuery.data.workspaceLinks.find(
                    l => l.trelloWorkspaceId === ws.id,
                )
                next[ws.id] = {
                    mode: 'existing',
                    teamId: existing?.teamId || teamId,
                    createTeamName: ws.name,
                }
            }
            return next
        })

        setBoardChoices(prev => {
            const next = { ...prev }
            for (const board of catalogQuery.data.boards) {
                if (next[board.id]) continue
                next[board.id] = {
                    selected: false,
                    mode: board.existingLink ? 'existing' : 'create',
                    projectId: board.existingLink?.projectId || '',
                    createProjectName: board.name,
                    syncEnabled: board.existingLink?.syncEnabled ?? false,
                }
            }
            return next
        })
    }, [catalogQuery.data, teamId])

    const teamProjects = useMemo(
        () => projects.filter(p => p.teamId === teamId),
        [projects, teamId],
    )

    const handleConnect = async () => {
        try {
            const { url } = await authorize.mutateAsync(teamSlug)
            window.location.href = url
        }
        catch {
            toast.error('Could not start Trello authorization')
        }
    }

    const handleDisconnect = async () => {
        try {
            await disconnect.mutateAsync()
            toast.success('Trello disconnected')
        }
        catch {
            toast.error('Could not disconnect Trello')
        }
    }

    const handleImport = async () => {
        if (!catalogQuery.data) return

        const selectedBoards = catalogQuery.data.boards.filter(
            b => boardChoices[b.id]?.selected,
        )

        if (selectedBoards.length === 0) {
            toast.error('Select at least one board to import')
            return
        }

        const neededWorkspaceIds = new Set(
            selectedBoards.map(b => b.trelloWorkspaceId),
        )

        const workspaceMappings = catalogQuery.data.workspaces
            .filter(ws => neededWorkspaceIds.has(ws.id))
            .map(ws => {
                const choice = workspaceChoices[ws.id]
                if (choice?.mode === 'create') {
                    return {
                        trelloWorkspaceId: ws.id,
                        trelloWorkspaceName: ws.name,
                        createTeamName: choice.createTeamName || ws.name,
                    }
                }
                return {
                    trelloWorkspaceId: ws.id,
                    trelloWorkspaceName: ws.name,
                    teamId: choice?.teamId || teamId,
                }
            })

        const boardMappings = selectedBoards.map(board => {
            const choice = boardChoices[board.id]
            const wsChoice = workspaceChoices[board.trelloWorkspaceId]
            const resolvedTeamId = wsChoice?.mode === 'create'
                ? undefined
                : (wsChoice?.teamId || teamId)

            if (choice?.mode === 'existing' && choice.projectId) {
                return {
                    trelloBoardId: board.id,
                    teamId: resolvedTeamId,
                    projectId: choice.projectId,
                    syncEnabled: choice.syncEnabled,
                }
            }

            return {
                trelloBoardId: board.id,
                teamId: resolvedTeamId,
                createProjectName: choice?.createProjectName || board.name,
                syncEnabled: choice?.syncEnabled ?? false,
            }
        })

        try {
            const result = await runImport.mutateAsync({ workspaceMappings, boardMappings })
            const ok = result.results.filter(r => r.ok).length
            const fail = result.results.length - ok
            if (fail === 0)
                toast.success(`Imported ${ok} board${ok === 1 ? '' : 's'}`)
            else
                toast.message(`Imported ${ok}, failed ${fail}`)
            await catalogQuery.refetch()
        }
        catch {
            toast.error('Import failed')
        }
    }

    const status = statusQuery.data
    const catalog = catalogQuery.data

    return (
        <section className="rounded-2xl border border-neutral-200 shadow-sm">
            <div className="border-b border-neutral-100 px-6 py-4 flex items-center justify-between gap-4">
                <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
                        Integrations
                    </p>
                    <h2 className="text-lg font-medium mt-1">Trello</h2>
                    <p className="text-sm text-neutral-500 mt-1">
                        Import workspaces and boards into {teamName}. Optionally keep boards in sync via webhooks.
                    </p>
                </div>
                {status?.connected ? (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDisconnect}
                        disabled={disconnect.isPending}>
                        <Unplug className="h-4 w-4 mr-2" />
                        Disconnect
                    </Button>
                ) : null}
            </div>

            <div className="px-6 py-6 space-y-6">
                {statusQuery.isLoading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Checking Trello connection…
                    </div>
                ) : !status?.configured ? (
                    <p className="text-sm text-muted-foreground">
                        Trello OAuth is not configured on the server. Set
                        {' '}
                        <code className="text-xs">TRELLO_OAUTH_CLIENT_ID</code>
                        {' '}and{' '}
                        <code className="text-xs">TRELLO_OAUTH_CLIENT_SECRET</code>.
                    </p>
                ) : !status.connected ? (
                    <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                            Connect your Trello account to import boards into this team.
                        </p>
                        <Button onClick={handleConnect} disabled={authorize.isPending}>
                            {authorize.isPending ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : null}
                            Connect Trello
                        </Button>
                    </div>
                ) : catalogQuery.isLoading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading Trello boards…
                    </div>
                ) : catalogQuery.isError ? (
                    <p className="text-sm text-destructive">
                        Could not load Trello catalog. Try disconnecting and reconnecting.
                    </p>
                ) : catalog ? (
                    <div className="space-y-8">
                        <div className="text-sm text-muted-foreground">
                            Connected as
                            {' '}
                            <span className="font-medium text-foreground">
                                @{status.connection?.trelloUsername || status.connection?.trelloMemberId}
                            </span>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm font-medium">1. Map workspaces → teams</h3>
                            <div className="divide-y divide-border rounded-lg border">
                                {catalog.workspaces.map(ws => {
                                    const choice = workspaceChoices[ws.id]
                                    const selectValue = choice?.mode === 'create'
                                        ? CREATE_VALUE
                                        : (choice?.teamId || teamId)
                                    return (
                                        <div key={ws.id} className="flex flex-wrap items-center gap-4 p-4">
                                            <div className="min-w-[10rem] flex-1">
                                                <div className="font-medium text-sm">{ws.name}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {ws.boardCount} board{ws.boardCount === 1 ? '' : 's'}
                                                    {ws.isPersonal ? ' · personal' : ''}
                                                </div>
                                            </div>
                                            <div className="w-full sm:w-64">
                                                <Label className="sr-only">Team destination</Label>
                                                <select
                                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                                                    value={selectValue}
                                                    onChange={e => {
                                                        const value = e.target.value
                                                        setWorkspaceChoices(prev => ({
                                                            ...prev,
                                                            [ws.id]: value === CREATE_VALUE
                                                                ? {
                                                                    mode: 'create',
                                                                    teamId: '',
                                                                    createTeamName: ws.name,
                                                                }
                                                                : {
                                                                    mode: 'existing',
                                                                    teamId: value,
                                                                    createTeamName: ws.name,
                                                                },
                                                        }))
                                                    }}>
                                                    {catalog.teams.map(t => (
                                                        <option key={t.id} value={t.id}>
                                                            {t.name}
                                                        </option>
                                                    ))}
                                                    <option value={CREATE_VALUE}>Create new team…</option>
                                                </select>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm font-medium">2. Choose boards → projects</h3>
                            <div className="divide-y divide-border rounded-lg border">
                                {catalog.boards.map(board => {
                                    const choice = boardChoices[board.id]
                                    const linked = Boolean(board.existingLink)
                                    const projectValue = choice?.mode === 'existing' && choice.projectId
                                        ? choice.projectId
                                        : CREATE_VALUE
                                    return (
                                        <div key={board.id} className="p-4 space-y-3">
                                            <div className="flex flex-wrap items-start gap-3">
                                                <input
                                                    type="checkbox"
                                                    className="mt-1 h-4 w-4"
                                                    checked={choice?.selected ?? false}
                                                    onChange={e => {
                                                        setBoardChoices(prev => ({
                                                            ...prev,
                                                            [board.id]: {
                                                                ...prev[board.id],
                                                                selected: e.target.checked,
                                                            },
                                                        }))
                                                    }}
                                                    id={`board-${board.id}`}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <Label
                                                        htmlFor={`board-${board.id}`}
                                                        className="font-medium text-sm cursor-pointer">
                                                        {board.name}
                                                    </Label>
                                                    <div className="text-xs text-muted-foreground mt-0.5">
                                                        {catalog.workspaces.find(
                                                            w => w.id === board.trelloWorkspaceId,
                                                        )?.name || 'Workspace'}
                                                        {linked ? ' · already linked' : ''}
                                                    </div>
                                                </div>
                                                {linked && board.existingLink ? (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={async () => {
                                                            try {
                                                                await resync.mutateAsync(board.existingLink!.id)
                                                                toast.success('Re-synced')
                                                            }
                                                            catch {
                                                                toast.error('Re-sync failed')
                                                            }
                                                        }}
                                                        disabled={resync.isPending}>
                                                        <RefreshCw className="h-3.5 w-3.5 mr-1" />
                                                        Re-sync
                                                    </Button>
                                                ) : null}
                                            </div>

                                            {(choice?.selected || linked) ? (
                                                <div className="ml-7 flex flex-wrap gap-4 items-center">
                                                    <select
                                                        className="flex h-9 w-full sm:w-56 rounded-md border border-input bg-transparent px-3 text-sm"
                                                        value={projectValue}
                                                        onChange={e => {
                                                            const value = e.target.value
                                                            setBoardChoices(prev => ({
                                                                ...prev,
                                                                [board.id]: {
                                                                    ...prev[board.id],
                                                                    mode: value === CREATE_VALUE ? 'create' : 'existing',
                                                                    projectId: value === CREATE_VALUE ? '' : value,
                                                                },
                                                            }))
                                                        }}>
                                                        <option value={CREATE_VALUE}>Create new project</option>
                                                        {teamProjects.map(p => (
                                                            <option key={p.id} value={p.id}>
                                                                {p.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <label className="flex items-center gap-2 text-sm">
                                                        <input
                                                            type="checkbox"
                                                            className="h-4 w-4"
                                                            checked={choice?.syncEnabled ?? false}
                                                            onChange={async e => {
                                                                const enabled = e.target.checked
                                                                setBoardChoices(prev => ({
                                                                    ...prev,
                                                                    [board.id]: {
                                                                        ...prev[board.id],
                                                                        syncEnabled: enabled,
                                                                    },
                                                                }))
                                                                if (board.existingLink) {
                                                                    try {
                                                                        await setSync.mutateAsync({
                                                                            boardLinkId: board.existingLink.id,
                                                                            syncEnabled: enabled,
                                                                        })
                                                                        toast.success(
                                                                            enabled
                                                                                ? 'Sync enabled'
                                                                                : 'Sync disabled',
                                                                        )
                                                                    }
                                                                    catch {
                                                                        toast.error('Could not update sync')
                                                                    }
                                                                }
                                                            }}
                                                        />
                                                        Keep in sync
                                                    </label>
                                                </div>
                                            ) : null}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button
                                onClick={handleImport}
                                disabled={runImport.isPending}>
                                {runImport.isPending ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Check className="h-4 w-4 mr-2" />
                                )}
                                Import selected
                            </Button>
                        </div>
                    </div>
                ) : null}
            </div>
        </section>
    )
}
