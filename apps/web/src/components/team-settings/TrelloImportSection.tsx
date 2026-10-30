'use client'

import { useQueryClient } from '@tanstack/react-query'
import { Check, Loader2, RefreshCw, Unplug } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    useTrelloAuthorizeMutation,
    useTrelloDisconnectMutation,
    useTrelloImportMutation,
    useTrelloMemberMappingsMutation,
    useTrelloResyncMutation,
    useTrelloSyncMutation,
} from '@/lib/mutations/trello.mutations'
import { useGetProjectsQuery } from '@/lib/queries/projects.queries'
import {
    trelloStatusQueryKey,
    useTrelloCatalogQuery,
    useTrelloMembersQuery,
    useTrelloStatusQuery,
} from '@/lib/queries/trello.queries'
import { useProjectStore } from '@/store'

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
    const statusQuery = useTrelloStatusQuery(teamId)
    const catalogQuery = useTrelloCatalogQuery(teamId, Boolean(statusQuery.data?.connected))
    const authorize = useTrelloAuthorizeMutation()
    const disconnect = useTrelloDisconnectMutation(teamId)
    const runImport = useTrelloImportMutation(teamId)
    const saveMappings = useTrelloMemberMappingsMutation(teamId)
    const setSync = useTrelloSyncMutation(teamId)
    const resync = useTrelloResyncMutation(teamId)
    
    useGetProjectsQuery(teamId)
    const projects = useProjectStore(s => s.projects)
    
    const [boardChoices, setBoardChoices] = useState<Record<string, BoardChoice>>({})
    const [emailOverrides, setEmailOverrides] = useState<Record<string, string>>({})
    const [emailsBoardKey, setEmailsBoardKey] = useState('')
    
    const trelloFlag = searchParams.get('trello')
    
    useEffect(() => {
        if (!trelloFlag) return
        if (trelloFlag === 'connected')
            toast.success('Trello connected for this team')
        if (trelloFlag === 'error')
            toast.error('Trello connection failed')
        const next = new URLSearchParams(searchParams)
        next.delete('trello')
        setSearchParams(next, { replace: true })
        void queryClient.invalidateQueries({ queryKey: trelloStatusQueryKey(teamId) })
    }, [trelloFlag, searchParams, setSearchParams, queryClient, teamId])
    
    const catalogBoards = catalogQuery.data?.boards
    
    const nextBoardChoices = useMemo(() => {
        if (!catalogBoards)
            return null
        const next: Record<string, BoardChoice> = { ...boardChoices }
        let changed = false
        for (const board of catalogBoards) {
            if (next[board.id])
                continue
            next[board.id] = {
                selected: false,
                mode: board.existingLink ? 'existing' : 'create',
                projectId: board.existingLink?.projectId || '',
                createProjectName: board.name,
                syncEnabled: board.existingLink?.syncEnabled ?? false,
            }
            changed = true
        }
        return changed ? next : null
    }, [catalogBoards, boardChoices])
    
    if (nextBoardChoices)
        setBoardChoices(nextBoardChoices)
    
    const selectedOrLinkedBoardIds = useMemo(() => {
        if (!catalogQuery.data)
            return [] as string[]
        return catalogQuery.data.boards
            .filter(b => boardChoices[b.id]?.selected || b.existingLink)
            .map(b => b.id)
    }, [catalogQuery.data, boardChoices])
    
    const membersBoardKey = selectedOrLinkedBoardIds.slice().sort().join(',')
    
    const membersQuery = useTrelloMembersQuery(
        teamId,
        selectedOrLinkedBoardIds,
        Boolean(statusQuery.data?.connected) && selectedOrLinkedBoardIds.length > 0,
    )
    
    if (emailsBoardKey !== membersBoardKey) {
        setEmailsBoardKey(membersBoardKey)
        setEmailOverrides({})
    }
    
    const memberEmails = useMemo(() => {
        const next: Record<string, string> = {}
        for (const member of membersQuery.data?.members ?? []) {
            next[member.trelloMemberId] = emailOverrides[member.trelloMemberId]
                ?? member.email
                ?? member.suggestedEmail
                ?? ''
        }
        return next
    }, [membersQuery.data, emailOverrides])
    
    const teamProjects = useMemo(
        () => projects.filter(p => p.teamId === teamId),
        [projects, teamId],
    )
    
    const buildMemberMappings = () => {
        if (!membersQuery.data)
            return []
        return membersQuery.data.members
            .map(member => {
                const email = (memberEmails[member.trelloMemberId] || '').trim()
                if (!email || !email.includes('@'))
                    return null
                return {
                    trelloMemberId: member.trelloMemberId,
                    email,
                    trelloUsername: member.trelloUsername,
                    trelloFullName: member.trelloFullName,
                }
            })
            .filter((m): m is NonNullable<typeof m> => Boolean(m))
    }
    
    const handleConnect = async () => {
        try {
            const { url } = await authorize.mutateAsync({ teamId, returnTeamSlug: teamSlug })
            window.location.href = url
        }
        catch {
            toast.error('Could not start Trello authorization')
        }
    }
    
    const handleDisconnect = async () => {
        try {
            await disconnect.mutateAsync()
            toast.success('Trello disconnected from this team')
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
            .map(ws => ({
                trelloWorkspaceId: ws.id,
                trelloWorkspaceName: ws.name,
                teamId,
            }))
        
        const boardMappings = selectedBoards.map(board => {
            const choice = boardChoices[board.id]
            
            if (choice?.mode === 'existing' && choice.projectId) {
                return {
                    trelloBoardId: board.id,
                    teamId,
                    projectId: choice.projectId,
                    syncEnabled: choice.syncEnabled,
                }
            }
            
            return {
                trelloBoardId: board.id,
                teamId,
                createProjectName: choice?.createProjectName || board.name,
                syncEnabled: choice?.syncEnabled ?? false,
            }
        })
        
        try {
            const memberMappings = buildMemberMappings()
            const result = await runImport.mutateAsync({
                teamId,
                workspaceMappings,
                boardMappings,
                memberMappings,
            })
            const ok = result.results.filter(r => r.ok).length
            const fail = result.results.length - ok
            if (fail === 0)
                toast.success(`Imported ${ok} board${ok === 1 ? '' : 's'}`)
            else
                toast.message(`Imported ${ok}, failed ${fail}`)
            await catalogQuery.refetch()
            await membersQuery.refetch()
            setEmailOverrides({})
        }
        catch {
            toast.error('Import failed')
        }
    }
    
    const handleSaveMappings = async () => {
        const mappings = buildMemberMappings()
        if (mappings.length === 0) {
            toast.error('Enter at least one teammate email')
            return
        }
        try {
            const result = await saveMappings.mutateAsync(mappings)
            toast.success(
                `Saved ${result.linked} teammate${result.linked === 1 ? '' : 's'}`
                + (result.created ? ` (${result.created} new)` : ''),
            )
            await membersQuery.refetch()
            setEmailOverrides({})
        }
        catch {
            toast.error('Could not save teammate emails')
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
                        Link a Trello account to {teamName} (shared with team members).
                        Import boards and optionally keep them in sync.
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
                            Connect a Trello account for this team.
                            Other teams can link a different account.
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
                            <h3 className="text-sm font-medium">1. Workspaces on this Trello account</h3>
                            <p className="text-xs text-muted-foreground">
                                Boards import into {teamName}.
                                Other teams can link a different Trello account.
                            </p>
                            <div className="divide-y divide-border rounded-lg border">
                                {catalog.workspaces.map(ws => (
                                    <div key={ws.id} className="flex flex-wrap items-center gap-4 p-4">
                                        <div className="min-w-[10rem] flex-1">
                                            <div className="font-medium text-sm">{ws.name}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {ws.boardCount} board{ws.boardCount === 1 ? '' : 's'}
                                                {ws.isPersonal ? ' · personal' : ''}
                                            </div>
                                        </div>
                                    </div>
                                ))}
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
                                                        className={[
                                                            'flex h-9 w-full sm:w-56 rounded-md',
                                                            'border border-input bg-transparent px-3 text-sm',
                                                        ].join(' ')}
                                                        value={projectValue}
                                                        onChange={e => {
                                                            const value = e.target.value
                                                            const isCreate = value === CREATE_VALUE
                                                            setBoardChoices(prev => ({
                                                                ...prev,
                                                                [board.id]: {
                                                                    ...prev[board.id],
                                                                    mode: isCreate ? 'create' : 'existing',
                                                                    projectId: isCreate ? '' : value,
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
                        
                        {selectedOrLinkedBoardIds.length > 0 ? (
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium">3. Map teammates</h3>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Assign emails to Trello members. They appear as teammates now;
                                        when they sign up with that email they claim the account.
                                    </p>
                                </div>
                                {membersQuery.isLoading ? (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Loading board members…
                                    </div>
                                ) : membersQuery.isError ? (
                                    <p className="text-sm text-destructive">
                                        Could not load Trello members.
                                    </p>
                                ) : (membersQuery.data?.members.length ?? 0) === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        No members found on the selected boards.
                                    </p>
                                ) : (
                                    <div className="divide-y divide-border rounded-lg border">
                                        {membersQuery.data!.members.map(member => {
                                            const label = member.trelloFullName
                                                || member.trelloUsername
                                                || member.trelloMemberId
                                            const status = member.claimed
                                                ? 'Active'
                                                : member.userId
                                                    ? 'Pending claim'
                                                    : 'Unmapped'
                                            return (
                                                <div
                                                    key={member.trelloMemberId}
                                                    className="flex flex-wrap items-center gap-3 p-4">
                                                    <div className="min-w-[10rem] flex-1">
                                                        <div className="font-medium text-sm">
                                                            {label}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {member.trelloUsername
                                                                ? `@${member.trelloUsername}`
                                                                : member.trelloMemberId}
                                                            {' · '}
                                                            {status}
                                                        </div>
                                                    </div>
                                                    <Input
                                                        type="email"
                                                        className="h-9 w-full sm:w-64"
                                                        placeholder="email@company.com"
                                                        value={memberEmails[member.trelloMemberId] ?? ''}
                                                        onChange={e => {
                                                            const value = e.target.value
                                                            setEmailOverrides(prev => ({
                                                                ...prev,
                                                                [member.trelloMemberId]: value,
                                                            }))
                                                        }}
                                                        disabled={member.claimed}
                                                    />
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                                <div className="flex justify-end">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleSaveMappings}
                                        disabled={
                                            saveMappings.isPending
                                            || membersQuery.isLoading
                                        }>
                                        {saveMappings.isPending ? (
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : null}
                                        Save teammate emails
                                    </Button>
                                </div>
                            </div>
                        ) : null}
                        
                        <div className="flex justify-end">
                            <Button
                                onClick={handleImport}
                                disabled={runImport.isPending}>
                                {runImport.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
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
