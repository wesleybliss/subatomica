'use client'

import { useRef, useState } from 'react'
import { Task } from '@/types'
import { Flag, Calendar } from 'lucide-react'
import Link from 'next/link'
import { updateTask, deleteTask } from '@/lib/db/actions/tasks'

interface KanbanCardDndProps {
    task: Task
    onDrop: (taskId: string, newStatus: string, targetTaskId?: string) => void
}

export function KanbanCardDnd({ task, onDrop }: KanbanCardDndProps) {
    const cardRef = useRef<HTMLDivElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [title, setTitle] = useState(task.title)

    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('taskId', task.id)
        setIsDragging(true)
    }

    const handleDragEnd = () => {
        setIsDragging(false)
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        const draggedTaskId = e.dataTransfer.getData('taskId')
        if (draggedTaskId && draggedTaskId !== task.id) {
            onDrop(draggedTaskId, task.status, task.id)
        }
    }

    const handleTitleBlur = async () => {
        setIsEditing(false)
        if (title !== task.title && title.trim()) {
            try {
                await updateTask(task.id, { title })
            } catch (error) {
                console.error('[v0] Failed to update task title:', error)
                setTitle(task.title)
            }
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleTitleBlur()
        } else if (e.key === 'Escape') {
            setTitle(task.title)
            setIsEditing(false)
        }
    }

    // Format project ID display
    const projectDisplay = task.projectId?.slice(0, 8).toUpperCase() || 'TASK'

    return (
        <div
            ref={cardRef}
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`bg-card border border-border rounded-lg p-3 cursor-move transition-all hover:shadow-md hover:border-primary/50 ${
                isDragging ? 'opacity-50' : 'opacity-100'
            }`}
        >
            <div className="flex items-start justify-between gap-2 mb-2">
                <Link
                    href={`/t/${task.projectId}/p/${task.projectId}/s/${task.id}`}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors font-mono"
                    onClick={(e) => e.stopPropagation()}
                >
                    {projectDisplay}
                </Link>
                {task.priority === 'high' || task.priority === 'urgent' ? (
                    <Flag className="w-3 h-3 text-destructive" />
                ) : null}
            </div>

            {isEditing ? (
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={handleTitleBlur}
                    onKeyDown={handleKeyDown}
                    className="w-full text-sm font-medium bg-transparent border-none outline-none focus:ring-1 focus:ring-primary rounded px-1 -mx-1"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                />
            ) : (
                <h4
                    className="text-sm font-medium text-foreground mb-2 cursor-text"
                    onClick={(e) => {
                        e.stopPropagation()
                        setIsEditing(true)
                    }}
                >
                    {task.title}
                </h4>
            )}

            <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                    {task.assigneeId && (
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="text-xs font-medium text-primary">
                                {task.assigneeId.slice(0, 1).toUpperCase()}
                            </span>
                        </div>
                    )}
                    {task.dueDate && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
