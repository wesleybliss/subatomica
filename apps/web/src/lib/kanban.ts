import { UniqueIdentifier } from '@dnd-kit/core'
import { Task, TaskStatus } from '@repo/shared/types'

export const resolveTarget = (
    overId: UniqueIdentifier,
    overData: Record<string, unknown> | undefined,
    board: Task[],
): { status: TaskStatus, overTaskId?: string } | null => {
    if (overData?.type === 'column' && typeof overData.status === 'string')
        return { status: overData.status as TaskStatus }
    
    if (overData?.type === 'task') {
        const overTaskId = String(overId)
        // Prefer live board status — droppable data can lag one frame after a move
        const live = board.find(t => t.id === overTaskId)?.status
        const status = (live ?? overData.status) as TaskStatus | undefined
        if (!status) return null
        return { status, overTaskId }
    }
    
    const col = String(overId).match(/^column:(.+)$/)
    
    return col ? { status: col[1] as TaskStatus } : null
}
