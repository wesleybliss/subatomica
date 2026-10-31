import { useQueryClient } from '@tanstack/react-query'
import {
    type ReactNode,
    useEffect,
    useMemo,
    useState,
} from 'react'

import { SyncContext, type SyncContextValue } from '@/components/sync/sync-context'
import { disconnectAbly, subscribeProjectInvalidates } from '@/lib/sync/ablyClient'
import { startBackgroundSync } from '@/lib/sync/backgroundSync'
import { SyncEngine } from '@/lib/sync/syncEngine'
import { useAblyUiStore } from '@/store'

const POLL_INTERVAL_MS = 8_000

export function SyncProvider({ children }: { children: ReactNode }) {
    const queryClient = useQueryClient()
    const [engine] = useState(() => new SyncEngine(queryClient))
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
