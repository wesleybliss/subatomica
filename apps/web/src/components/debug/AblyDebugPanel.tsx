import { useSyncExternalStore } from 'react'

import { Button } from '@/components/ui/button'
import { ablyDebugLog, type AblyLogEntry } from '@/lib/sync/ablyDebugLog'
import { cn } from '@/lib/utils'

const formatTime = (at: number) =>
    new Date(at).toLocaleTimeString(undefined, {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        fractionalSecondDigits: 3,
    })

const AblyLogRow = ({ entry }: { entry: AblyLogEntry }) => (
    <article
        className={cn(
            'border-b border-slate-200 px-3 py-2 font-mono text-[11px] leading-relaxed',
            entry.direction === 'out' ? 'bg-sky-50/80' : 'bg-emerald-50/60',
        )}>
        <div className="flex flex-wrap items-center gap-2 text-slate-600">
            <span className="tabular-nums text-slate-400">{formatTime(entry.at)}</span>
            <span className={cn(
                'rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase',
                entry.direction === 'out'
                    ? 'bg-sky-200/80 text-sky-900'
                    : 'bg-emerald-200/80 text-emerald-900',
            )}>
                {entry.direction === 'out' ? 'out →' : '← in'}
            </span>
            <span className="text-slate-500">{entry.kind}</span>
            {entry.channel && (
                <span className="truncate text-slate-400">{entry.channel}</span>
            )}
        </div>
        <p className="mt-1 break-words text-slate-800">{entry.summary}</p>
        {entry.payload !== undefined && entry.payload !== null && (
            <pre className="mt-1 max-h-28 overflow-auto whitespace-pre-wrap break-all
                rounded bg-white/70 p-2 text-[10px] text-slate-600">
                {JSON.stringify(entry.payload, null, 2)}
            </pre>
        )}
    </article>
)

const AblyDebugPanel = () => {
    const entries = useSyncExternalStore(
        ablyDebugLog.subscribe,
        ablyDebugLog.getSnapshot,
        ablyDebugLog.getSnapshot,
    )
    
    return (
        <div className="flex h-full min-h-0 flex-col">
            <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-3 py-2">
                <div>
                    <p className="text-xs font-medium text-slate-800">Ably traffic</p>
                    <p className="text-[10px] text-slate-500">
                        Client token/subscribe (out) and invalidate/connection (in)
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => ablyDebugLog.clear()}>
                    Clear
                </Button>
            </div>
            
            <div className="min-h-0 flex-1 overflow-y-auto">
                {entries.length === 0 ? (
                    <p className="px-3 py-6 text-center text-xs text-slate-500">
                        No Ably messages yet. Turn on the navbar Ably toggle, set
                        `ABLY_ENABLED=true` + `ABLY_API_KEY` on the API, then mutate a
                        task from another tab.
                    </p>
                ) : (
                    entries.map(entry => (
                        <AblyLogRow key={entry.id} entry={entry} />
                    ))
                )}
            </div>
        </div>
    )
}

export default AblyDebugPanel
