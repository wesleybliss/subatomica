'use client'
import { useEffect, useRef, useState } from 'react'
import { Task } from '@/types'
import { Flag, Calendar } from 'lucide-react'
import Link from 'next/link'
import { updateTask } from '@/lib/db/actions/tasks'
import { cn } from '@/lib/utils'
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine'
import { isTaskDragData } from './dragTypes'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface KanbanCardDndProps {
    task: Task
    teamId?: string
}

export function KanbanCardDnd({ task, teamId }: KanbanCardDndProps) {
    const cardRef = useRef<HTMLDivElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [title, setTitle] = useState(task.title)
    const [description, setDescription] = useState(task.description ?? '')
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
    const handleOpenChange = (open: boolean) => {
        setIsDialogOpen(open)
        if (open) {
            setTitle(task.title)
            setDescription(task.description ?? '')
        }
    }
    const handleSave = async () => {
        const nextTitle = title.trim()
        if (!nextTitle) return
        setIsSaving(true)
        try {
            await updateTask(task.id, {
                title: nextTitle,
                description,
            })
            setTitle(nextTitle)
            setIsDialogOpen(false)
        } catch (error) {
            console.error('[v0] Failed to update task:', error)
            setTitle(task.title)
            setDescription(task.description ?? '')
        } finally {
            setIsSaving(false)
        }
    }
    // Format project ID display
    const projectDisplay = task.projectId?.slice(0, 8).toUpperCase() || 'TASK'
    const teamSegment = teamId ?? task.projectId
    const taskHref = `/t/${teamSegment}/p/${task.projectId}/s/${task.id}`
    return (
        <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
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
                    {title}
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
            <DialogContent className="sm:max-w-[520px]">
                <DialogHeader>
                    <DialogTitle>Edit task</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor={`task-title-${task.id}`}>Title</Label>
                        <Input
                            id={`task-title-${task.id}`}
                            value={title}
                            onChange={event => setTitle(event.target.value)}
                            placeholder="Task title" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor={`task-description-${task.id}`}>Description</Label>
                        <Textarea
                            id={`task-description-${task.id}`}
                            value={description}
                            onChange={event => setDescription(event.target.value)}
                            placeholder="Add a short description" />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose render={<Button variant="outline" type="button" />}>
                        Cancel
                    </DialogClose>
                    <Button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving || !title.trim()}>
                        {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
