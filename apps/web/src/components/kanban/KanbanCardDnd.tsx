import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine'
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { Task, TeamMemberProfile } from '@repo/shared/types'
import { useEffect, useRef, useState } from 'react'

import { TaskDetailDialog } from '@/components/tasks/TaskDetailDialog'

import { isTaskDragData } from './dragTypes'
import { KanbanCardFace } from './KanbanCardFace'

interface KanbanCardDndProps {
    task: Task
    teamId?: string
    teamMembers: TeamMemberProfile[]
}

export function KanbanCardDnd({ task, teamId, teamMembers }: KanbanCardDndProps) {
    const cardRef = useRef<HTMLDivElement>(null)
    const [isDragging, setIsDragging] = useState(false)
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
                onDrop: () => setIsDragging(false),
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
            }),
        )
    }, [task.id, task.status])
    
    return (
        <>
            <div ref={cardRef}>
                <KanbanCardFace
                    task={task}
                    teamId={teamId}
                    teamMembers={teamMembers}
                    isDragging={isDragging}
                    onOpen={() => setIsDialogOpen(true)} />
            </div>
            <TaskDetailDialog
                task={task}
                teamMembers={teamMembers}
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen} />
        </>
    )
}
