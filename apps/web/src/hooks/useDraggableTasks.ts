import { DragOverEvent, DragStartEvent } from '@dnd-kit/core'
import { Task } from '@repo/shared/types'
import { useState } from 'react'

import { resolveTarget } from '@/lib/kanban'

const useDraggableTasks = (
    onAfterDragStart: () => void,
    onAfterDragOver: () => void,
) => {
    
    const [activeTask, setActiveTask] = useState<Task | null>(null)
    
    const onDragStart = (event: DragStartEvent) => {
        lastOverId.current = null
        recentlyMovedToNewContainer.current = false
        const data = event.active.data.current
        if (data?.type === 'task') {
            dragSnapshot.current = vm.localTasks
            const task = vm.localTasks.find(t => t.id === String(event.active.id))
            setActiveTask(task ?? null)
        }
    }
    
    const onDragOver = (event: DragOverEvent) => {
        const { active, over } = event
        if (!over) return
        if (active.id === over.id) return
        if (active.data.current?.type !== 'task') return
        if (over.data.current?.type === 'lane') return
        
        const activeId = String(active.id)
        const board = tasksRef.current
        const activeTaskRow = board.find(t => t.id === activeId)
        if (!activeTaskRow) return
        
        const target = resolveTarget(
            over.id,
            over.data.current as Record<string, unknown> | undefined,
            board,
        )
        if (!target) return
        
        // CRITICAL: only setState when crossing containers.
        // Same-column reorder is sortable transforms + onDragEnd.
        // Live same-column setState ↔ collision flip caused max update depth.
        if (activeTaskRow.status === target.status) return
        
        const next = moveTaskInBoard(board, activeId, target.status, target.overTaskId)
        if (!next) return
        
        recentlyMovedToNewContainer.current = true
        tasksRef.current = next
        vm.setLocalTasks(next)
    }
    
    return {
        activeTask,
        setActiveTask,
        onDragStart,
        onDragOver,
    }
    
}

export default useDraggableTasks
