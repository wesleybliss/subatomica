import type { Task } from '@repo/shared/types'
import Logger from '@repo/shared/utils/logger'
import type { QueryClient } from '@tanstack/react-query'

import { request } from '@/lib/api/client'

import {
    clearDirtyTasks,
    countDirtyTasks,
    listDirtyTasks,
    loadCursor,
    saveCursor,
} from './dirtyStore'

const log = new Logger('web/lib/sync/syncEngine')

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'paused'

export type SyncState = {
    status: SyncStatus
    pending: number
    failures: number
    lastSyncedAt: number | null
    failure: 'offline' | 'auth' | 'server' | null
}

type Scope = { teamId: string; projectId: string }

type PullResponse = { tasks: Task[]; cursor: string }
type PushResponse = { applied: Task[]; cursor: string }

export class SyncEngine {
    private state: SyncState = {
        status: 'idle',
        pending: 0,
        failures: 0,
        lastSyncedAt: null,
        failure: null,
    }
    
    private listeners = new Set<() => void>()
    private running: Promise<void> | null = null
    private rerun = false
    private activeScope: Scope | null = null
    
    constructor(private queryClient: QueryClient) {}
    
    subscribe = (listener: () => void) => {
        this.listeners.add(listener)
        return () => this.listeners.delete(listener)
    }
    
    getState = () => this.state
    
    private setState(next: SyncState) {
        this.state = next
        for (const listener of this.listeners) listener()
    }
    
    async refreshPending() {
        const pending = await countDirtyTasks()
        this.setState({ ...this.state, pending })
    }
    
    setActiveScope(scope: Scope | null) {
        this.activeScope = scope
        void this.reconcile()
    }
    
    reconcile(): Promise<void> {
        if (this.running) {
            this.rerun = true
            return this.running
        }
        this.running = this.cycle().finally(() => {
            this.running = null
        })
        return this.running
    }
    
    private async cycle() {
        do {
            this.rerun = false
            try {
                await this.pass()
                this.setState({
                    status: 'idle',
                    pending: await countDirtyTasks(),
                    failures: 0,
                    lastSyncedAt: Date.now(),
                    failure: null,
                })
            } catch (error) {
                log.w('sync pass failed', error)
                const offline = typeof navigator !== 'undefined' && !navigator.onLine
                this.setState({
                    status: 'error',
                    pending: await countDirtyTasks(),
                    failures: this.state.failures + 1,
                    lastSyncedAt: this.state.lastSyncedAt,
                    failure: offline ? 'offline' : 'server',
                })
            }
        } while (this.rerun)
    }
    
    private async pass() {
        const scope = this.activeScope
        if (!scope) return
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
            this.setState({ ...this.state, status: 'paused', failure: 'offline' })
            return
        }
        
        const dirty = await listDirtyTasks(scope.projectId)
        if (dirty.length > 0) {
            this.setState({ ...this.state, status: 'syncing', pending: dirty.length })
            const pushed = await request<PushResponse>(
                `/sync/push?teamId=${scope.teamId}&projectId=${scope.projectId}`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        changes: dirty.map(row => ({
                            id: row.id,
                            updatedAt: row.updatedAt,
                            title: row.title,
                            description: row.description,
                            status: row.status,
                            order: row.order,
                        })),
                    }),
                },
            )
            await clearDirtyTasks(dirty.map(d => d.id))
            this.mergeTasks(scope, pushed.applied)
            if (pushed.cursor)
                await saveCursor(scope.teamId, scope.projectId, pushed.cursor)
        }
        
        const since = await loadCursor(scope.teamId, scope.projectId)
        const pulled = await request<PullResponse>(
            `/sync/pull?teamId=${scope.teamId}&projectId=${scope.projectId}&since=${encodeURIComponent(since)}`,
        )
        this.mergeTasks(scope, pulled.tasks)
        if (pulled.cursor)
            await saveCursor(scope.teamId, scope.projectId, pulled.cursor)
    }
    
    private mergeTasks(scope: Scope, incoming: Task[]) {
        if (!incoming.length) return
        const key = ['tasks', scope.teamId, scope.projectId] as const
        this.queryClient.setQueryData<Task[]>(key, current => {
            const map = new Map((current || []).map(task => [task.id, task]))
            for (const task of incoming) {
                const existing = map.get(task.id)
                if (!existing || task.updatedAt >= existing.updatedAt)
                    map.set(task.id, task)
            }
            return Array.from(map.values())
        })
    }
}
