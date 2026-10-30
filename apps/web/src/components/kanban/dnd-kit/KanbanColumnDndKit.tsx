import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { Task, TaskStatus, TeamMemberProfile } from '@repo/shared/types'
import { useMemo } from 'react'

import { cn } from '@/lib/utils'

import { KanbanCardDndKit } from './KanbanCardDndKit'

type KanbanColumnDndKitProps = {
    status: TaskStatus
    tasks: Task[]
    teamId?: string
    teamMembers: TeamMemberProfile[]
}

export const KanbanColumnDndKit = ({
    status,
    tasks,
    teamId,
    teamMembers,
}: KanbanColumnDndKitProps) => {
    const data = useMemo(
        () => ({ type: 'column' as const, status }),
        [status],
    )
    
    const { setNodeRef, isOver } = useDroppable({
        id: `column:${status}`,
        data,
    })
    
    const itemIds = useMemo(() => tasks.map(t => t.id), [tasks])
    const empty = tasks.length === 0
    
    return (
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
            <div
                ref={setNodeRef}
                className={cn(
                    // Tall hit target so empty lanes are easy to pointerWithin
                    'space-y-2 h-full min-h-[12rem] bg-muted/30 rounded-lg p-2 pb-4',
                    empty && isOver && 'ring-1 ring-primary/40 bg-primary/5',
                )}>
                {tasks.map(task => (
                    <KanbanCardDndKit
                        key={task.id}
                        task={task}
                        teamId={teamId}
                        teamMembers={teamMembers} />
                ))}
                {empty && !isOver && (
                    <div className="text-center text-muted-foreground text-sm py-8">
                        No tasks
                    </div>
                )}
            </div>
        </SortableContext>
    )
}
