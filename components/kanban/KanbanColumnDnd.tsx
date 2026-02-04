'use client'
import { useRef, useEffect } from 'react'
import { Task, TaskStatus } from '@/types'
import { KanbanCardDnd } from './KanbanCardDnd'
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { isTaskDragData } from './dragTypes'

interface KanbanColumnProps {
    status: TaskStatus
    tasks: Task[]
    teamId?: string
}

export function KanbanColumn({ status, tasks, teamId }: KanbanColumnProps) {
    const columnRef = useRef<HTMLDivElement>(null)
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
        })
    }, [status])
    return (
        <div
            ref={columnRef}
            className="space-y-2 min-h-[200px] bg-muted/30 rounded-lg p-2">
            {tasks.map(task => (
                <KanbanCardDnd
                    key={task.id}
                    task={task}
                    teamId={teamId}/>
            ))}
            {tasks.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-8">
                    No tasks
                </div>
            )}
        </div>
    )
}
