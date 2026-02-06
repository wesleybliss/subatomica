'use client'

import { useRef, useEffect, useState } from 'react'
import { Task, TeamMemberProfile } from '@/types'
import { Calendar, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    draggable,
    dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine'
import { TaskDetailDialog } from '@/components/tasks/TaskDetailDialog'

interface ListViewRowProps {
    task: Task
    selected: boolean
    onToggle: () => void
    teamMembers: TeamMemberProfile[]
    onDelete?: (taskId: string) => void
}

const priorityColors: Record<string, string> = {
    urgent: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-200',
    high: (
        'bg-orange-100 text-orange-700 '
        + 'dark:bg-orange-950 dark:text-orange-200'
    ),
    medium: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-200',
    low: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
}

export function ListViewRow({
    task,
    selected,
    onToggle,
    teamMembers,
    onDelete,
}: ListViewRowProps) {
    const rowRef = useRef<HTMLDivElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    
    const assignee = teamMembers.find(m => m.id === task.assigneeId)
    
    useEffect(() => {
        const element = rowRef.current
        if (!element) return
        
        return combine(
            draggable({
                element,
                getInitialData: () => ({
                    type: 'list-task',
                    taskId: task.id,
                    status: task.status,
                }),
                onDragStart: () => setIsDragging(true),
                onDrop: () => setIsDragging(false),
            }),
            dropTargetForElements({
                element,
                getData: () => ({
                    type: 'list-task',
                    taskId: task.id,
                    status: task.status,
                }),
                canDrop: (args: {
                    source: { data: Record<string, unknown> }
                }) => {
                    const data = args.source.data
                    return (
                        (data.type === 'list-task'
                        || data.type === 'list-group')
                        && data.taskId !== task.id
                    )
                },
            }),
        )
    }, [task.id, task.status])
    
    const formatDate = (date: string | null) => {
        if (!date) return ''
        return new Date(date).toLocaleDateString(
            'en-US',
            { month: 'short', day: 'numeric' },
        )
    }
    
    return (
        <>
            <div
                ref={rowRef}
                className={cn(
                    'group flex items-center gap-4 px-4 py-3',
                    'border-b border-border hover:bg-muted/50',
                    'transition-colors',
                    isDragging && 'opacity-50 bg-primary/5',
                    selected && 'bg-primary/10',
                )}>
                {/* Checkbox */}
                <input
                    type="checkbox"
                    checked={selected}
                    onChange={onToggle}
                    className={cn(
                        'w-4 h-4 rounded border-border',
                        'cursor-pointer flex-shrink-0',
                    )}/>
                
                {/* Task Title */}
                <button
                    onClick={() => setIsDialogOpen(true)}
                    className={cn(
                        'flex-1 text-left text-sm font-medium',
                        'text-card-foreground hover:text-primary',
                        'transition-colors truncate',
                    )}>
                    {task.title}
                </button>
                
                {/* Assignee */}
                <div className="w-24">
                    {assignee ? (
                        <div className="flex items-center gap-2">
                            <div
                                className={cn(
                                    'w-6 h-6 rounded-full',
                                    'bg-primary/20 flex items-center',
                                    'justify-center flex-shrink-0',
                                )}>
                                <span
                                    className={cn(
                                        'text-xs font-medium text-primary',
                                    )}>
                                    {assignee.name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <span
                                className={cn(
                                    'text-xs text-muted-foreground',
                                    'truncate hidden sm:inline',
                                )}>
                                {assignee.name}
                            </span>
                        </div>
                    ) : (
                        <span className="text-xs text-muted-foreground">
                            —
                        </span>
                    )}
                </div>
                
                {/* Due Date */}
                <div className="w-24">
                    {task.dueDate ? (
                        <div
                            className={cn(
                                'flex items-center gap-1',
                                'text-xs text-muted-foreground',
                            )}>
                            <Calendar className="w-3 h-3 flex-shrink-0" />
                            <span>{formatDate(task.dueDate)}</span>
                        </div>
                    ) : (
                        <span className="text-xs text-muted-foreground">
                            —
                        </span>
                    )}
                </div>
                
                {/* Priority */}
                <div className="w-24">
                    {task.priority ? (
                        <span
                            className={cn(
                                'inline-flex px-2 py-1 rounded',
                                'text-xs font-medium',
                                priorityColors[task.priority]
                                    || priorityColors.low,
                            )}>
                            {task.priority.charAt(0).toUpperCase()
                            + task.priority.slice(1)}
                        </span>
                    ) : (
                        <span className="text-xs text-muted-foreground">
                            —
                        </span>
                    )}
                </div>
                
                {/* Delete Button */}
                <button
                    onClick={e => {
                        e.stopPropagation()
                        onDelete?.(task.id)
                    }}
                    className={cn(
                        'p-1.5 hover:bg-destructive/10',
                        'rounded transition-colors',
                        'opacity-0 group-hover:opacity-100',
                    )}
                    aria-label="Delete task">
                    <Trash2 className="w-4 h-4 text-destructive" />
                </button>
            </div>
            
            <TaskDetailDialog
                task={task}
                teamMembers={teamMembers}
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}/>
        </>
    )
}
