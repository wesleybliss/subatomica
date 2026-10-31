import {
    closestCorners,
    type CollisionDetection,
    getFirstCollision,
    pointerWithin,
    type UniqueIdentifier,
} from '@dnd-kit/core'
import type { MutableRefObject } from 'react'

/**
 * Empty columns fail with closestCorners alone. Prefer pointer hits; stabilize
 * with lastOverId after a cross-container move (official MultipleContainers pattern)
 * so collision thrashing can't feed an onDragOver setState loop.
 */
export const createKanbanCollisionDetection = (
    lastOverId: MutableRefObject<UniqueIdentifier | null>,
    recentlyMovedToNewContainer: MutableRefObject<boolean>,
): CollisionDetection => args => {
    const pointerHits = pointerWithin(args)
    
    if (pointerHits.length > 0) {
        const byId = new Map(
            args.droppableContainers.map(c => [c.id, c.data.current]),
        )
        
        const taskHit = pointerHits.find(c => byId.get(c.id)?.type === 'task')
        const columnHit = pointerHits.find(c => byId.get(c.id)?.type === 'column')
        const hit = taskHit ?? columnHit ?? getFirstCollision(pointerHits)
        
        if (hit) {
            lastOverId.current = hit.id
            return [hit]
        }
    }
    
    // After moving into a new column, droppable rects are mid-remeasure — keep
    // last over so we don't oscillate and re-enter onDragOver setState.
    if (recentlyMovedToNewContainer.current) {
        recentlyMovedToNewContainer.current = false
        if (lastOverId.current !== null)
            return [{ id: lastOverId.current }]
    }
    
    const corners = closestCorners(args)
    const first = getFirstCollision(corners)
    if (first) {
        lastOverId.current = first.id
        return [first]
    }
    
    return lastOverId.current !== null ? [{ id: lastOverId.current }] : []
}
