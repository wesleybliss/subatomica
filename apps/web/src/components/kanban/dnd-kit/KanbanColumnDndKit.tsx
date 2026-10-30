import { useDroppable } from '@dnd-kit/core'
import type { Task, TaskStatus, TeamMemberProfile } from '@repo/shared/types'
import { Fragment } from 'react'

import { cn } from '@/lib/utils'

import { KanbanCardDndKit } from './KanbanCardDndKit'

type KanbanColumnDndKitProps = {
    status: TaskStatus
    tasks: Task[]
    teamId?: string
    teamMembers: TeamMemberProfile[]
    dropIndicator?: {
        status: TaskStatus
        taskId?: string
    } | null
}

export const KanbanColumnDndKit = ({
    status,
    tasks,
    teamId,
    teamMembers,
    dropIndicator,
}: KanbanColumnDndKitProps) => {
    const { setNodeRef, isOver } = useDroppable({
        id: `column:${status}`,
        data: { type: 'column', status },
    })
    
    const indicatorIndex = (() => {
        if (!dropIndicator || dropIndicator.status !== status) return -1
        if (dropIndicator.taskId) {
            const foundIndex = tasks.findIndex(task => task.id === dropIndicator.taskId)
            return foundIndex === -1 ? tasks.length : foundIndex
        }
        return tasks.length
    })()
    
    const showEmptyState = tasks.length === 0 && indicatorIndex === -1
    
    return (
        <div
            ref={setNodeRef}
            className={cn(
                'space-y-2 h-full bg-muted/30 rounded-lg p-2 pb-4',
                isOver && 'ring-1 ring-primary/40',
            )}>
            {tasks.map((task, index) => (
                <Fragment key={task.id}>
                    {indicatorIndex === index && (
                        <div className="h-16 rounded-lg border border-dashed border-primary/50 bg-primary/5" />
                    )}
                    <KanbanCardDndKit
                        task={task}
                        teamId={teamId}
                        teamMembers={teamMembers} />
                </Fragment>
            ))}
            {indicatorIndex === tasks.length && (
                <div className="h-16 rounded-lg border border-dashed border-primary/50 bg-primary/5" />
            )}
            {showEmptyState && (
                <div className="text-center text-muted-foreground text-sm py-8">
                    No tasks
                </div>
            )}
        </div>
    )
}
