'use client'

import { useRef, useEffect } from 'react'
import { Task, TaskStatus } from '@/types'
import { KanbanCardDnd } from './KanbanCardDnd'

interface KanbanColumnProps {
    status: TaskStatus
    tasks: Task[]
    onDrop: (taskId: string, newStatus: TaskStatus, targetTaskId?: string) => Promise<void> | void
    teamId?: string
}

export function KanbanColumn({ status, tasks, onDrop, teamId }: KanbanColumnProps) {
    const columnRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const column = columnRef.current
        if (!column) return

        // Setup drop zone for the column
        const handleDragOver = (e: DragEvent) => {
            e.preventDefault()
            e.dataTransfer!.dropEffect = 'move'
        }

        const handleDrop = (e: DragEvent) => {
            e.preventDefault()
            const taskId = e.dataTransfer?.getData('taskId')
            if (taskId) {
                onDrop(taskId, status)
            }
        }

        column.addEventListener('dragover', handleDragOver)
        column.addEventListener('drop', handleDrop)

        return () => {
            column.removeEventListener('dragover', handleDragOver)
            column.removeEventListener('drop', handleDrop)
        }
    }, [status, onDrop])

    return (
        <div
            ref={columnRef}
            className="space-y-2 min-h-[200px] bg-muted/30 rounded-lg p-2"
        >
            {tasks.map(task => (
                <KanbanCardDnd
                    key={task.id}
                    task={task}
                    onDrop={onDrop}
                    teamId={teamId}
                />
            ))}
            {tasks.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-8">
                    No tasks
                </div>
            )}
        </div>
    )
}
