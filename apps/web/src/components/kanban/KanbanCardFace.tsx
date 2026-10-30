import type { Task, TeamMemberProfile } from '@repo/shared/types'
import { format } from 'date-fns'
import { convert } from 'html-to-text'
import { Calendar, Flag } from 'lucide-react'
import { memo, useMemo } from 'react'
import { Link } from 'react-router-dom'

import { cn } from '@/lib/utils'

type KanbanCardFaceProps = {
    task: Task
    teamId?: string
    teamMembers: TeamMemberProfile[]
    className?: string
    isDragging?: boolean
    onOpen?: () => void
}

export const KanbanCardFace = memo(function KanbanCardFace({
    task,
    teamId,
    className,
    isDragging = false,
    onOpen,
}: KanbanCardFaceProps) {
    const teamSegment = teamId ?? task.projectId
    const taskHref = `/t/${teamSegment}/p/${task.projectId}/s/${task.id}`
    
    // html-to-text is expensive — never re-run it on every dnd-kit context tick
    const descriptionPreview = useMemo(
        () => convert(task.description ?? '', { wordwrap: false }).substring(0, 100),
        [task.description],
    )
    
    const createdLabel = useMemo(
        () => format(task.createdAt, 'MMM d'),
        [task.createdAt],
    )
    
    return (
        <div
            className={cn(
                'bg-card border border-border rounded-lg p-3 cursor-move min-w-0 overflow-hidden',
                'transition-shadow transition-colors hover:shadow-md hover:border-primary/50',
                isDragging ? 'opacity-50' : 'opacity-100',
                className,
            )}
            onClick={() => {
                if (!isDragging) onOpen?.()
            }}>
            <div className="flex items-start justify-between gap-2 mb-2">
                <Link
                    to={taskHref}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors font-mono"
                    onClick={e => e.stopPropagation()}>
                    {createdLabel}
                </Link>
                {task.priority === 'high' || task.priority === 'urgent' ? (
                    <Flag className="w-3 h-3 text-destructive" />
                ) : null}
            </div>
            <h4 className="text-sm font-medium text-foreground mb-2 break-all">
                {task.title}
            </h4>
            {descriptionPreview ? (
                <div className="text-xs text-muted-foreground mb-2 break-all">
                    {descriptionPreview}
                </div>
            ) : null}
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
    )
})
