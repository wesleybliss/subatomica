import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { Task, TeamMemberProfile } from '@repo/shared/types'
import { Flag, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine'
import { isTaskDragData } from './dragTypes'
import { TaskDetailDialog } from '@/components/tasks/TaskDetailDialog'

interface KanbanCardDndProps {
    task: Task
    teamId?: string
    teamMembers: TeamMemberProfile[]
}

export function KanbanCardDnd({ task, teamId, teamMembers }: KanbanCardDndProps) {
    const cardRef = useRef<HTMLDivElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    useEffect(() => {
        const element = cardRef.current
        if (!element) return
        return combine(
            draggable({
                element,
                getInitialData: () => ({
                    type: 'task',
                    taskId: task.id,
                    status: task.status,
                }),
                onDragStart: () => setIsDragging(true),
                onDrop: () => setIsDragging(false),
            }),
            dropTargetForElements({
                element,
                getData: () => ({
                    type: 'task',
                    taskId: task.id,
                    status: task.status,
                }),
                canDrop: (args: { source: { data: Record<string, unknown> } }) =>
                    isTaskDragData(args.source.data)
                    && args.source.data.taskId !== task.id,
            }),
        )
    }, [task.id, task.status])
    // Format project ID display
    const projectDisplay = task.projectId?.slice(0, 8).toUpperCase() || 'TASK'
    const teamSegment = teamId ?? task.projectId
    const taskHref = `/t/${teamSegment}/p/${task.projectId}/s/${task.id}`
    return (
        <>
            <div
                ref={cardRef}
                className={cn(
                    'bg-card border border-border rounded-lg p-3 cursor-move',
                    'transition-all hover:shadow-md hover:border-primary/50', {
                        'opacity-50': isDragging,
                        'opacity-100': !isDragging,
                    },
                )}
                onClick={() => {
                    if (!isDragging) setIsDialogOpen(true)
                }}>
                <div className="flex items-start justify-between gap-2 mb-2">
                    <Link
                        href={taskHref}
                        className="text-xs text-muted-foreground hover:text-primary transition-colors font-mono"
                        onClick={e => e.stopPropagation()}>
                        {projectDisplay}
                    </Link>
                    {task.priority === 'high' || task.priority === 'urgent' ? (
                        <Flag className="w-3 h-3 text-destructive" />
                    ) : null}
                </div>
                <h4 className="text-sm font-medium text-foreground mb-2">
                    {task.title}
                </h4>
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
                                <span>{new Date(task.dueDate)
                                    .toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <TaskDetailDialog
                task={task}
                teamMembers={teamMembers}
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen} />
        </>
    )
}
