'use client'
import { Fragment, useRef, useEffect } from 'react'
import { Task, TaskStatus } from '@/types'
import { KanbanCardDnd } from './KanbanCardDnd'
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { isTaskDragData } from './dragTypes'

interface KanbanColumnProps {
    status: TaskStatus
    tasks: Task[]
    teamId?: string
    dropIndicator?: {
        status: TaskStatus
        taskId?: string
    } | null
    draggingTaskId?: string | null
}

export function KanbanColumn({
    status,
    tasks,
    teamId,
    dropIndicator,
}: KanbanColumnProps) {
    const columnRef = useRef<HTMLDivElement>(null)
    const indicatorIndex = (() => {
        if (!dropIndicator || dropIndicator.status !== status) return -1
        if (dropIndicator.taskId) {
            const foundIndex = tasks.findIndex(task => task.id === dropIndicator.taskId)
            return foundIndex === -1 ? tasks.length : foundIndex
        }
        return tasks.length
    })()
    const showEmptyState = tasks.length === 0 && indicatorIndex === -1
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
            {tasks.map((task, index) => (
                <Fragment key={task.id}>
                    {indicatorIndex === index && (
                        <div className="h-16 rounded-lg border border-dashed border-primary/50 bg-primary/5" />
                    )}
                    <KanbanCardDnd
                        task={task}
                        teamId={teamId}/>
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
