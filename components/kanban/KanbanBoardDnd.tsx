'use client'

import { useState, useEffect } from 'react'
import { Task } from '@/types'
import { KanbanColumn } from './KanbanColumnDnd'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { createTask, updateTaskOrder } from '@/lib/db/actions/tasks'

export interface KanbanBoardProps {
    tasks: Task[]
    projectId?: string
    teamId?: string
    onRefresh?: () => void
}

const STATUSES = [
    { id: 'backlog', label: 'Backlog', color: 'bg-muted' },
    { id: 'todo', label: 'Todo', color: 'bg-blue-500/20' },
    { id: 'in-progress', label: 'In Progress', color: 'bg-primary/20' },
    { id: 'done', label: 'Done', color: 'bg-green-500/20' },
]

export function KanbanBoardDnd({ tasks, projectId, teamId, onRefresh }: KanbanBoardProps) {
    const [localTasks, setLocalTasks] = useState<Task[]>(tasks)
    const [isCreating, setIsCreating] = useState<string | null>(null)

    useEffect(() => {
        setLocalTasks(tasks)
    }, [tasks])

    const handleDrop = async (taskId: string, newStatus: string, targetTaskId?: string) => {
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
                t.id === taskId ? { ...t, status: newStatus, order: newOrder } : t
            )
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
    }

    const handleCreateTask = async (status: string) => {
        if (!projectId) return

        setIsCreating(status)
        try {
            await createTask({
                title: 'New Task',
                content: '',
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
                                disabled={isCreating === status.id}
                            >
                                <Plus className="w-3 h-3" />
                            </Button>
                        </div>

                        <KanbanColumn
                            status={status.id}
                            tasks={statusTasks}
                            onDrop={handleDrop}
                        />
                    </div>
                )
            })}
        </div>
    )
}
