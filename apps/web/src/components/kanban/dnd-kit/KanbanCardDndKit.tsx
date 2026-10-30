import { useDraggable, useDroppable } from '@dnd-kit/core'
import type { Task, TeamMemberProfile } from '@repo/shared/types'
import { useCallback, useRef, useState } from 'react'

import { TaskDetailDialog } from '@/components/tasks/TaskDetailDialog'
import { cn } from '@/lib/utils'

import { KanbanCardFace } from '../KanbanCardFace'

const CLICK_SUPPRESS_MS = 250

type KanbanCardDndKitProps = {
    task: Task
    teamId?: string
    teamMembers: TeamMemberProfile[]
}

export const KanbanCardDndKit = ({ task, teamId, teamMembers }: KanbanCardDndKitProps) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const dragEndedAt = useRef(0)
    
    const {
        attributes,
        listeners,
        setNodeRef: setDragRef,
        isDragging,
    } = useDraggable({
        id: task.id,
        data: { type: 'task', taskId: task.id, status: task.status },
    })
    
    const { setNodeRef: setDropRef } = useDroppable({
        id: `task:${task.id}`,
        data: { type: 'task', taskId: task.id, status: task.status },
    })
    
    const setRef = useCallback((node: HTMLElement | null) => {
        setDragRef(node)
        setDropRef(node)
    }, [setDragRef, setDropRef])
    
    if (isDragging)
        dragEndedAt.current = Date.now()
    
    return (
        <>
            <div
                ref={setRef}
                {...listeners}
                {...attributes}
                className={cn('touch-manipulation outline-none', isDragging && 'opacity-40')}>
                <KanbanCardFace
                    task={task}
                    teamId={teamId}
                    teamMembers={teamMembers}
                    isDragging={isDragging}
                    onOpen={() => {
                        if (Date.now() - dragEndedAt.current < CLICK_SUPPRESS_MS) return
                        setIsDialogOpen(true)
                    }} />
            </div>
            <TaskDetailDialog
                task={task}
                teamMembers={teamMembers}
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen} />
        </>
    )
}
