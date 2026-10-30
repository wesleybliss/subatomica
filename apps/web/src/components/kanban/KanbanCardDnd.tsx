import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine'
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { Task, TeamMemberProfile } from '@repo/shared/types'
import { useEffect, useRef, useState } from 'react'

import { TaskDetailDialog } from '@/components/tasks/TaskDetailDialog'
import { cn } from '@/lib/utils'

import { isTaskDragData } from './dragTypes'
import { KanbanCardFace } from './KanbanCardFace'
import { KanbanDropGhost } from './KanbanDropGhost'

const CLICK_SUPPRESS_MS = 250

interface KanbanCardDndProps {
    task: Task
    teamId?: string
    teamMembers: TeamMemberProfile[]
}

export function KanbanCardDnd({ task, teamId, teamMembers }: KanbanCardDndProps) {
    const cardRef = useRef<HTMLDivElement>(null)
    const dragEndedAt = useRef(0)
    const [isDragging, setIsDragging] = useState(false)
    const [isDropTarget, setIsDropTarget] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    
    useEffect(() => {
        const element = cardRef.current
        if (!element) return
        return combine(
            draggable({
                element,
                getInitialData: () => ({
                    type: 'task',
                    taskId: task.id,
                    status: task.status,
                }),
                onDragStart: () => setIsDragging(true),
                onDrop: () => {
                    dragEndedAt.current = Date.now()
                    setIsDragging(false)
                    setIsDropTarget(false)
                },
            }),
            dropTargetForElements({
                element,
                getData: () => ({
                    type: 'task',
                    taskId: task.id,
                    status: task.status,
                }),
                canDrop: (args: { source: { data: Record<string, unknown> } }) =>
                    isTaskDragData(args.source.data)
                    && args.source.data.taskId !== task.id,
                onDragEnter: () => setIsDropTarget(true),
                onDragLeave: () => setIsDropTarget(false),
                onDrop: () => setIsDropTarget(false),
            }),
        )
    }, [task.id, task.status])
    
    return (
        <>
            {/*
              Ghost MUST sit inside the drop-target element. A sibling ghost above
              the target pushes the card out from under the pointer → leave → remove
              ghost → enter → infinite flicker (the "stutter like crazy" bug).
            */}
            <div
                ref={cardRef}
                className={cn('space-y-2', isDragging && 'opacity-40')}>
                {isDropTarget ? <KanbanDropGhost /> : null}
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
