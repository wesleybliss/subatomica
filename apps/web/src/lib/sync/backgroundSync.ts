/**
 * Poll reconcile while the tab is visible; also reconcile on online / focus.
 */
export function startBackgroundSync(
    reconcile: () => void,
    intervalMs: number,
): () => void {
    let id: ReturnType<typeof setInterval> | undefined
    
    // oxlint-disable-next-line no-restricted-globals
    const doc = document
    
    const tick = () => {
        if (doc.visibilityState === 'visible')
            reconcile()
    }
    
    const start = () => {
        if (id === undefined)
            id = setInterval(tick, intervalMs)
    }
    
    const stop = () => {
        if (id !== undefined) {
            clearInterval(id)
            id = undefined
        }
    }
    
    const onVisibility = () => {
        if (doc.visibilityState === 'visible') {
            tick()
            start()
        } else {
            stop()
        }
    }
    
    const onOnline = () => {
        reconcile()
    }
    
    doc.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('online', onOnline)
    window.addEventListener('focus', tick)
    onVisibility()
    
    return () => {
        doc.removeEventListener('visibilitychange', onVisibility)
        window.removeEventListener('online', onOnline)
        window.removeEventListener('focus', tick)
        stop()
    }
}
