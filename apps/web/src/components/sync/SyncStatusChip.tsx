import { Cloud, CloudOff, Loader2, RefreshCw } from 'lucide-react'

import { useSync, useSyncState } from '@/components/sync/SyncProvider'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const SyncStatusChip = () => {
    const state = useSyncState()
    const { engine } = useSync()
    
    const label = (() => {
        if (state.status === 'syncing') return 'Syncing'
        if (state.status === 'paused' || state.failure === 'offline') return 'Offline'
        if (state.status === 'error') return 'Sync error'
        if (state.pending > 0) return `${state.pending} pending`
        if (state.lastSyncedAt)
            return 'Synced'
        return 'Ready'
    })()
    
    const Icon = state.status === 'syncing'
        ? Loader2
        : state.failure === 'offline' || state.status === 'paused'
            ? CloudOff
            : state.status === 'error'
                ? RefreshCw
                : Cloud
    
    return (
        <Button
            type="button"
            variant="ghost"
            size="xs"
            title="Click to sync now"
            onClick={() => void engine.reconcile()}
            className={cn(
                'gap-1.5 text-muted-foreground',
                state.status === 'error' && 'text-destructive',
            )}>
            <Icon className={cn('size-3.5', state.status === 'syncing' && 'animate-spin')} />
            <span>{label}</span>
        </Button>
    )
}
