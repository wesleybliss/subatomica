import {
    type CollisionDetection,
    type DragEndEvent,
    type DragOverEvent,
    type DragStartEvent,
    type UniqueIdentifier,
} from '@dnd-kit/core'
import { Task } from '@repo/shared/types'
import { useCallback, useEffect, useRef, useState } from 'react'

import { createKanbanCollisionDetection } from '@/components/kanban/dnd-kit/collision'
import { moveTaskInBoard } from '@/components/kanban/kanbanDndOrder'
import { resolveTarget } from '@/lib/kanban'

interface UseDraggableTasksArgs {
    displayTasks: Task[]
    setDragProjection: (tasks: Task[] | null) => void
    persistTask: (taskList: Task[], taskId: string) => void
    reorderLane: (sourceLaneId: string, targetLaneId: string) => void
}

const useDraggableTasks = ({
    displayTasks,
    setDragProjection,
    persistTask,
    reorderLane,
}: UseDraggableTasksArgs) => {
    
    const [activeTask, setActiveTask] = useState<Task | null>(null)
    
    const dragSnapshotRef = useRef<Task[] | null>(null)
    const tasksRef = useRef(displayTasks)
    const lastOverIdRef = useRef<UniqueIdentifier | null>(null)
    const recentlyMovedToNewContainerRef = useRef(false)
    
    useEffect(() => {
        tasksRef.current = displayTasks
    }, [displayTasks])
    
    const collisionDetection = useCallback<CollisionDetection>(
        args => createKanbanCollisionDetection(lastOverIdRef, recentlyMovedToNewContainerRef)(args),
        [],
    )
    
    const resetDragUi = () => {
        setActiveTask(null)
        lastOverIdRef.current = null
        recentlyMovedToNewContainerRef.current = false
        dragSnapshotRef.current = null
    }
    
    const onDragStart = (event: DragStartEvent) => {
        lastOverIdRef.current = null
        recentlyMovedToNewContainerRef.current = false
        const data = event.active.data.current
        if (data?.type === 'task') {
            dragSnapshotRef.current = tasksRef.current
            const task = tasksRef.current.find(t => t.id === String(event.active.id))
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
        
        recentlyMovedToNewContainerRef.current = true
        tasksRef.current = next
        setDragProjection(next)
    }
    
    const onDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        resetDragUi()
        
        if (active.data.current?.type === 'lane') {
            setDragProjection(null)
            if (over?.data.current?.type === 'lane')
                void reorderLane(active.data.current.laneId, over.data.current.laneId)
            return
        }
        
        if (active.data.current?.type !== 'task') {
            setDragProjection(null)
            return
        }
        
        if (!over) {
            // Clearing projection restores the query-cache ordering
            setDragProjection(null)
            return
        }
        
        const board = tasksRef.current
        
        if (over.data.current?.type === 'lane') {
            persistTask(board, String(active.id))
            setDragProjection(null)
            return
        }
        
        // Finalize position (same-column reorder + any last cross-column nudge)
        const target = resolveTarget(
            over.id,
            over.data.current as Record<string, unknown> | undefined,
            board,
        )
        if (target) {
            const next = moveTaskInBoard(
                board,
                String(active.id),
                target.status,
                target.overTaskId,
            )
            if (next) {
                // Commit into query cache first, then drop the temporary projection
                persistTask(next, String(active.id))
                setDragProjection(null)
                return
            }
        }
        
        persistTask(board, String(active.id))
        setDragProjection(null)
    }
    
    const onDragCancel = () => {
        resetDragUi()
        setDragProjection(null)
    }
    
    return {
        activeTask,
        collisionDetection,
        onDragStart,
        onDragOver,
        onDragEnd,
        onDragCancel,
    }
    
}

export default useDraggableTasks
