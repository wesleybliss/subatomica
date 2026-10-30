import type { Task, TaskStatus } from '@repo/shared/types'

const byOrder = (a: Task, b: Task) => a.order - b.order

const withOrders = (columnTasks: Task[]): Task[] =>
    columnTasks.map((t, i) => ({ ...t, order: (i + 1) * 1000 }))

/**
 * Move `activeId` into `overStatus` before `overTaskId` (or append if omitted).
 * Returns null when the visual order would not change.
 */
export const moveTaskInBoard = (
    tasks: Task[],
    activeId: string,
    overStatus: TaskStatus,
    overTaskId?: string,
): Task[] | null => {
    const active = tasks.find(t => t.id === activeId)
    if (!active) return null
    
    const sourceStatus = active.status
    const sourceIds = tasks
        .filter(t => t.status === sourceStatus)
        .sort(byOrder)
        .map(t => t.id)
    
    const destIds = (
        sourceStatus === overStatus
            ? sourceIds
            : tasks.filter(t => t.status === overStatus).sort(byOrder).map(t => t.id)
    ).filter(id => id !== activeId)
    
    let insertAt = destIds.length
    if (overTaskId && overTaskId !== activeId) {
        const idx = destIds.indexOf(overTaskId)
        if (idx >= 0) insertAt = idx
    }
    
    const nextDestIds = [...destIds]
    nextDestIds.splice(insertAt, 0, activeId)
    
    // Same column, same order → skip setState
    if (sourceStatus === overStatus) {
        const same = sourceIds.length === nextDestIds.length
            && sourceIds.every((id, i) => id === nextDestIds[i])
        if (same) return null
    }
    
    const byId = new Map(tasks.map(t => [t.id, t]))
    const nextDest = withOrders(
        nextDestIds.map(id => {
            const t = byId.get(id)!
            return t.status === overStatus && id !== activeId
                ? t
                : { ...t, status: overStatus }
        }),
    )
    
    if (sourceStatus === overStatus)
        return [
            ...tasks.filter(t => t.status !== overStatus),
            ...nextDest,
        ]
    
    const nextSource = withOrders(
        sourceIds
            .filter(id => id !== activeId)
            .map(id => byId.get(id)!),
    )
    
    return [
        ...tasks.filter(t => t.status !== sourceStatus && t.status !== overStatus),
        ...nextSource,
        ...nextDest,
    ]
}
