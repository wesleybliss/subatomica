'use client'

import { useCallback, useEffect, useState } from 'react'
import { Task, TaskStatus } from '@/types'
import { KanbanColumn } from './KanbanColumnDnd'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { createTask, updateTaskOrder } from '@/lib/db/actions/tasks'
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import {
    type ColumnDropData,
    type TaskDropData,
    isColumnDropData,
    isTaskDragData,
    isTaskDropData,
} from './dragTypes'

export interface KanbanBoardProps {
    tasks: Task[]
    projectId?: string
    teamId?: string
    onRefresh?: () => void
}

const STATUSES: Array<{ id: TaskStatus; label: string; color: string }> = [
    { id: 'backlog', label: 'Backlog', color: 'bg-muted' },
    { id: 'todo', label: 'Todo', color: 'bg-blue-500/20' },
    { id: 'in-progress', label: 'In Progress', color: 'bg-primary/20' },
    { id: 'done', label: 'Done', color: 'bg-green-500/20' },
]

export function KanbanBoardDnd({ tasks, projectId, teamId, onRefresh }: KanbanBoardProps) {
    const [localTasks, setLocalTasks] = useState<Task[]>(tasks)
    const [isCreating, setIsCreating] = useState<string | null>(null)
    const [dropIndicator, setDropIndicator] = useState<{
        status: TaskStatus
        taskId?: string
    } | null>(null)
    const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null)
    useEffect(() => {
        setLocalTasks(tasks)
    }, [tasks])
    const handleDrop = useCallback(async (
        taskId: string,
        newStatus: TaskStatus,
        targetTaskId?: string,
    ) => {
        console.log('[v0] Drag drop:', { taskId, newStatus, targetTaskId })
        const task = localTasks.find(t => t.id === taskId)
        if (!task) return
        // Optimistic update
        const tasksInNewStatus = localTasks
            .filter(t => t.status === newStatus && t.id !== taskId)
            .sort((a, b) => a.order - b.order)
        let newOrder: number
        if (!targetTaskId) {
            // Drop at end
            const maxOrder = tasksInNewStatus.length > 0
                ? Math.max(...tasksInNewStatus.map(t => t.order))
                : 0
            newOrder = maxOrder + 1000
        } else {
            // Drop before target
            const targetIndex = tasksInNewStatus.findIndex(t => t.id === targetTaskId)
            const prevTask = targetIndex > 0 ? tasksInNewStatus[targetIndex - 1] : null
            const nextTask = tasksInNewStatus[targetIndex]
            if (prevTask && nextTask) {
                // Calculate midpoint
                newOrder = (prevTask.order + nextTask.order) / 2
            } else if (nextTask) {
                // First position
                newOrder = nextTask.order - 1000
            } else {
                // Only one item
                newOrder = 1000
            }
        }
        setLocalTasks(prev =>
            prev.map(t =>
                t.id === taskId ? { ...t, status: newStatus, order: newOrder } : t,
            ),
        )
        // Update in database
        try {
            await updateTaskOrder(taskId, newStatus, newOrder)
            onRefresh?.()
        } catch (error) {
            console.error('[v0] Failed to update task order:', error)
            // Revert optimistic update
            setLocalTasks(tasks)
        }
    }, [localTasks, onRefresh, tasks])
    useEffect(() => {
        const monitor = monitorForElements as unknown as (args: {
            onDragStart?: (args: { source: { data: Record<string, unknown> } }) => void
            onDrag?: (args: {
                location: { current: { dropTargets: Array<{ data: unknown }> } }
            }) => void
            onDrop?: (args: {
                source: { data: Record<string, unknown> }
                location: { current: { dropTargets: Array<{ data: unknown }> } }
            }) => void
            onDragEnd?: () => void
        }) => () => void
        return monitor({
            onDragStart: (args: { source: { data: Record<string, unknown> } }) => {
                if (isTaskDragData(args.source.data))
                    setDraggingTaskId(args.source.data.taskId)
            },
            onDrag: (args: {
                location: { current: { dropTargets: Array<{ data: unknown }> } }
            }) => {
                const dropTargets = args.location.current.dropTargets
                if (!dropTargets.length) {
                    setDropIndicator(null)
                    return
                }
                const taskTarget = dropTargets.find((target: { data: unknown }) =>
                    isTaskDropData(target.data as Record<string, unknown>),
                )
                if (taskTarget?.data && isTaskDropData(taskTarget.data as Record<string, unknown>)) {
                    const taskTargetData = taskTarget.data as TaskDropData
                    setDropIndicator({
                        status: taskTargetData.status,
                        taskId: taskTargetData.taskId,
                    })
                    return
                }
                const columnTarget = dropTargets.find((target: { data: unknown }) =>
                    isColumnDropData(target.data as Record<string, unknown>),
                )
                if (columnTarget?.data && isColumnDropData(columnTarget.data as Record<string, unknown>)) {
                    const columnTargetData = columnTarget.data as ColumnDropData
                    setDropIndicator({ status: columnTargetData.status })
                    return
                }
                setDropIndicator(null)
            },
            onDrop: (args: {
                source: { data: Record<string, unknown> }
                location: { current: { dropTargets: Array<{ data: unknown }> } }
            }) => {
                const { source, location } = args
                if (!isTaskDragData(source.data)) return
                const dropTargets = location.current.dropTargets
                if (!dropTargets.length) return
                const taskTarget = dropTargets.find((target: { data: unknown }) =>
                    isTaskDropData(target.data as Record<string, unknown>),
                )
                const taskTargetData = taskTarget?.data
                if (taskTargetData && isTaskDropData(taskTargetData as Record<string, unknown>)) {
                    const taskData = taskTargetData as TaskDropData
                    void handleDrop(
                        source.data.taskId,
                        taskData.status,
                        taskData.taskId,
                    )
                    return
                }
                const columnTarget = dropTargets.find((target: { data: unknown }) =>
                    isColumnDropData(target.data as Record<string, unknown>),
                )
                const columnTargetData = columnTarget?.data
                if (columnTargetData && isColumnDropData(columnTargetData as Record<string, unknown>)) {
                    const columnData = columnTargetData as ColumnDropData
                    void handleDrop(
                        source.data.taskId,
                        columnData.status,
                    )
                }
                setDropIndicator(null)
                setDraggingTaskId(null)
            },
            onDragEnd: () => {
                setDropIndicator(null)
                setDraggingTaskId(null)
            },
        })
    }, [handleDrop])
    const handleCreateTask = async (status: TaskStatus) => {
        if (!projectId) return
        setIsCreating(status)
        try {
            await createTask({
                title: 'New Task',
                description: '',
                projectId,
                status,
            })
            onRefresh?.()
        } catch (error) {
            console.error('[v0] Failed to create task:', error)
        } finally {
            setIsCreating(null)
        }
    }
    return (
        <div className="flex gap-4 h-full overflow-x-auto pb-4">
            {STATUSES.map(status => {
                const statusTasks = localTasks
                    .filter(t => t.status === status.id)
                    .sort((a, b) => a.order - b.order)
                return (
                    <div key={status.id} className="flex-shrink-0 w-[320px]">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${status.color}`} />
                                <h3 className="text-sm font-medium text-foreground">
                                    {status.label}
                                </h3>
                                <span className="text-xs text-muted-foreground">
                                    {statusTasks.length}
                                </span>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => handleCreateTask(status.id)}
                                disabled={isCreating === status.id}>
                                <Plus className="w-3 h-3" />
                            </Button>
                        </div>
                        <KanbanColumn
                            status={status.id}
                            tasks={statusTasks}
                            teamId={teamId}
                            dropIndicator={dropIndicator}
                            draggingTaskId={draggingTaskId}/>
                    </div>
                )
            })}
        </div>
    )
}
