import {
    createContext,
    useContext,
    useEffect,
    useSyncExternalStore,
} from 'react'

import { type SyncEngine, type SyncState } from '@/lib/sync/syncEngine'

export type SyncContextValue = {
    engine: SyncEngine
    setScope: (teamId: string, projectId: string) => void
    clearScope: () => void
}

export const SyncContext = createContext<SyncContextValue | null>(null)

export function useSync() {
    const ctx = useContext(SyncContext)
    if (!ctx)
        throw new Error('useSync must be used within SyncProvider')
    return ctx
}

export function useSyncState(): SyncState {
    const { engine } = useSync()
    return useSyncExternalStore(engine.subscribe, engine.getState, engine.getState)
}

export function useSyncScope(teamId: string | undefined, projectId: string | undefined) {
    const { setScope, clearScope } = useSync()
    
    useEffect(() => {
        if (teamId && projectId) {
            setScope(teamId, projectId)
            return () => clearScope()
        }
        clearScope()
    }, [teamId, projectId, setScope, clearScope])
}
