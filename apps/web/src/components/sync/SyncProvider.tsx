import { useQueryClient } from '@tanstack/react-query'
import {
    createContext,
    type ReactNode,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    useSyncExternalStore,
} from 'react'

import { disconnectAbly, subscribeProjectInvalidates } from '@/lib/sync/ablyClient'
import { startBackgroundSync } from '@/lib/sync/backgroundSync'
import { SyncEngine, type SyncState } from '@/lib/sync/syncEngine'
import { useAblyUiStore } from '@/store'

const POLL_INTERVAL_MS = 8_000

type SyncContextValue = {
    engine: SyncEngine
    setScope: (teamId: string, projectId: string) => void
    clearScope: () => void
}

const SyncContext = createContext<SyncContextValue | null>(null)

export function SyncProvider({ children }: { children: ReactNode }) {
    const queryClient = useQueryClient()
    const engineRef = useRef<SyncEngine | null>(null)
    if (!engineRef.current)
        engineRef.current = new SyncEngine(queryClient)
    
    const engine = engineRef.current
    const [scope, setScopeState] = useState<{ teamId: string; projectId: string } | null>(null)
    const ablyEnabled = useAblyUiStore(s => s.ablyEnabled)
    
    useEffect(() => {
        void engine.refreshPending()
        return startBackgroundSync(() => {
            void engine.reconcile()
        }, POLL_INTERVAL_MS)
    }, [engine])
    
    useEffect(() => {
        engine.setActiveScope(scope)
    }, [engine, scope])
    
    useEffect(() => {
        if (!scope || !ablyEnabled) {
            disconnectAbly()
            return
        }
        
        let cancelled = false
        let unsubscribe = () => {}
        
        void subscribeProjectInvalidates(scope.projectId, payload => {
            if (cancelled) return
            const keys = payload.keys || ['tasks']
            for (const key of keys) {
                if (key === 'tasks') {
                    void queryClient.invalidateQueries({
                        queryKey: ['tasks', scope.teamId, scope.projectId],
                    })
                    void engine.reconcile()
                }
            }
        }).then(fn => {
            if (cancelled) fn()
            else unsubscribe = fn
        })
        
        return () => {
            cancelled = true
            unsubscribe()
            disconnectAbly()
        }
    }, [ablyEnabled, engine, queryClient, scope])
    
    const value = useMemo<SyncContextValue>(() => ({
        engine,
        setScope: (teamId, projectId) => setScopeState({ teamId, projectId }),
        clearScope: () => setScopeState(null),
    }), [engine])
    
    return (
        <SyncContext.Provider value={value}>
            {children}
        </SyncContext.Provider>
    )
}

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
