import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Task, TeamMemberProfile } from '@repo/shared/types'
import { useEffect, useMemo, useRef, useState } from 'react'

import { TaskDetailDialog } from '@/components/tasks/TaskDetailDialog'

import { KanbanCardFace } from '../KanbanCardFace'

const CLICK_SUPPRESS_MS = 250

type KanbanCardDndKitProps = {
    task: Task
    teamId?: string
    teamMembers: TeamMemberProfile[]
}

const noLayoutAnim = () => false

/**
 * Thin sortable shell. Card face is memoized so dnd-kit's per-frame transform
 * updates only touch this wrapper — matching the official demo pattern.
 */
export const KanbanCardDndKit = ({ task, teamId, teamMembers }: KanbanCardDndKitProps) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const dragEndedAt = useRef(0)
    const wasDragging = useRef(false)
    
    const data = useMemo(
        () => ({ type: 'task' as const, taskId: task.id, status: task.status }),
        [task.id, task.status],
    )
    
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task.id,
        data,
        animateLayoutChanges: noLayoutAnim,
    })
    
    useEffect(() => {
        if (wasDragging.current && !isDragging)
            dragEndedAt.current = Date.now()
        wasDragging.current = isDragging
    }, [isDragging])
    
    return (
        <>
            <div
                ref={setNodeRef}
                style={{
                    transform: CSS.Transform.toString(transform),
                    // Skip transition while dragging — snappier like the demos
                    transition: isDragging ? undefined : transition,
                    opacity: isDragging ? 0 : 1,
                }}
                {...listeners}
                {...attributes}
                className="touch-manipulation outline-none">
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
            {isDialogOpen ? (
                <TaskDetailDialog
                    task={task}
                    teamMembers={teamMembers}
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen} />
            ) : null}
        </>
    )
}
