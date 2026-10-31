/**
 * Hybrid logical clock so LWW timestamps stay monotonic across clock skew.
 */
export class HybridClock {
    private lastSeen = 0
    
    receive(ts: number | string) {
        const n = typeof ts === 'string' ? Date.parse(ts) : ts
        if (Number.isFinite(n) && n > this.lastSeen)
            this.lastSeen = n
    }
    
    nowIso() {
        this.lastSeen = Math.max(Date.now(), this.lastSeen + 1)
        return new Date(this.lastSeen).toISOString()
    }
    
    get last() {
        return this.lastSeen
    }
}

export const hybridClock = new HybridClock()
