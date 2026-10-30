import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { Task, TaskStatus, TeamMemberProfile } from '@repo/shared/types'
import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

import { isTaskDragData } from './dragTypes'
import { KanbanCardDnd } from './KanbanCardDnd'
import { KanbanDropGhost } from './KanbanDropGhost'

interface KanbanColumnProps {
    status: TaskStatus
    tasks: Task[]
    teamId?: string
    teamMembers: TeamMemberProfile[]
}

export function KanbanColumn({
    status,
    tasks,
    teamId,
    teamMembers,
}: KanbanColumnProps) {
    const columnRef = useRef<HTMLDivElement>(null)
    const [isInnermostTarget, setIsInnermostTarget] = useState(false)
    
    useEffect(() => {
        const column = columnRef.current
        if (!column) return
        return dropTargetForElements({
            element: column,
            getData: () => ({
                type: 'column',
                status,
            }),
            canDrop: (args: { source: { data: Record<string, unknown> } }) =>
                isTaskDragData(args.source.data),
            onDrag: ({ self, location }: {
                self: { element: Element }
                location: { current: { dropTargets: Array<{ element: Element }> } }
            }) => {
                const innermost = location.current.dropTargets[0]?.element === self.element
                setIsInnermostTarget(prev => (prev === innermost ? prev : innermost))
            },
            onDragLeave: () => setIsInnermostTarget(false),
            onDrop: () => setIsInnermostTarget(false),
        })
    }, [status])
    
    const showEmptyState = tasks.length === 0 && !isInnermostTarget
    
    return (
        <div
            ref={columnRef}
            className={cn(
                'space-y-2 h-full bg-muted/30 rounded-lg p-2 pb-4',
                isInnermostTarget && 'ring-1 ring-primary/40',
            )}>
            {tasks.map(task => (
                <KanbanCardDnd
                    key={task.id}
                    task={task}
                    teamId={teamId}
                    teamMembers={teamMembers} />
            ))}
            {isInnermostTarget ? <KanbanDropGhost /> : null}
            {showEmptyState && (
                <div className="text-center text-muted-foreground text-sm py-8">
                    No tasks
                </div>
            )}
        </div>
    )
}
