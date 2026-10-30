export type AblyLogDirection = 'in' | 'out'

export type AblyLogEntry = {
    id: string
    at: number
    direction: AblyLogDirection
    kind: string
    channel?: string
    summary: string
    payload?: unknown
}

const MAX_ENTRIES = 200

type Listener = () => void

let entries: AblyLogEntry[] = []
const listeners = new Set<Listener>()

const emit = () => {
    for (const listener of listeners) listener()
}

export const ablyDebugLog = {
    subscribe(listener: Listener) {
        listeners.add(listener)
        return () => listeners.delete(listener)
    },
    
    getSnapshot() {
        return entries
    },
    
    clear() {
        entries = []
        emit()
    },
    
    push(entry: Omit<AblyLogEntry, 'id' | 'at'> & { at?: number }) {
        const next: AblyLogEntry = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            at: entry.at ?? Date.now(),
            direction: entry.direction,
            kind: entry.kind,
            channel: entry.channel,
            summary: entry.summary,
            payload: entry.payload,
        }
        entries = [next, ...entries].slice(0, MAX_ENTRIES)
        emit()
    },
}
