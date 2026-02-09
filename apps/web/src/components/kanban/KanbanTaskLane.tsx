import { KanbanColumn } from './KanbanColumnDnd'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { GripVertical, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Task, TaskStatus, TaskLane, DropIndicatorData, TeamMemberProfile } from '@repo/shared/types'
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'
import ManageLaneDropdown from '@/components/kanban/ManageLaneDropdown'
import { cn } from '@/lib/utils'
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine'
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { isLaneDragData } from './dragTypes'

interface TaskLaneProps {
    lane: TaskLane
    tasks: Task[]
    teamId: string | undefined
    teamMembers: TeamMemberProfile[]
    isCollapsed: boolean
    onToggleCollapsed: (laneId: string) => void
    dropIndicator: DropIndicatorData | null
    draggingTaskId: string | null
    editingLaneId: string | null
    editingLaneName: string | null
    setEditingLaneName: Dispatch<SetStateAction<string>>
    isCreating: string | null
    savingLaneId: string | null
    canManageLanes: boolean
    canDeleteLane: boolean
    deletingLaneId: string | null
    handleCreateTask: (status: TaskStatus) => Promise<void>
    handleStartRenameLane: (lane: TaskLane) => void
    handleRenameLane: (laneId: string) => Promise<void>
    handleCancelRenameLane: () => void
    handleDeleteLane: (laneId: string) => Promise<void>
    handleReorderLane: (sourceLaneId: string, targetLaneId: string) => void
}

const KanbanTaskLane = ({
    lane,
    tasks = [],
    teamId,
    teamMembers,
    isCollapsed,
    onToggleCollapsed,
    dropIndicator,
    draggingTaskId,
    editingLaneId,
    editingLaneName,
    setEditingLaneName,
    isCreating,
    savingLaneId,
    canManageLanes,
    canDeleteLane,
    deletingLaneId,
    handleCreateTask,
    handleStartRenameLane,
    handleRenameLane,
    handleCancelRenameLane,
    handleDeleteLane,
    handleReorderLane,
}: TaskLaneProps) => {
    const laneRef = useRef<HTMLDivElement>(null)
    const dragHandleRef = useRef<HTMLDivElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [isDragOver, setIsDragOver] = useState(false)
    useEffect(() => {
        if (!canManageLanes) return
        const laneElement = laneRef.current
        const dragHandle = dragHandleRef.current
        if (!laneElement || !dragHandle) return
        return combine(
            draggable({
                element: laneElement,
                dragHandle,
                getInitialData: () => ({
                    type: 'lane',
                    laneId: lane.id,
                }),
                onDragStart: () => setIsDragging(true),
                onDrop: () => setIsDragging(false),
            }),
            dropTargetForElements({
                element: laneElement,
                getData: () => ({
                    type: 'lane',
                    laneId: lane.id,
                }),
                canDrop: (args: { source: { data: Record<string, unknown> } }) =>
                    isLaneDragData(args.source.data)
                    && args.source.data.laneId !== lane.id,
                onDragEnter: () => setIsDragOver(true),
                onDragLeave: () => setIsDragOver(false),
                onDrop: (args: { source: { data: Record<string, unknown> } }) => {
                    setIsDragOver(false)
                    if (!isLaneDragData(args.source.data)) return
                    handleReorderLane(args.source.data.laneId, lane.id)
                },
            }),
        )
    }, [canManageLanes, handleReorderLane, lane.id])
    
    const statusTasks = tasks
        .filter(t => t.status === lane.key)
        .sort((a, b) => a.order - b.order)
    
    return (
        
        <div
            ref={laneRef}
            className={cn('shrink-0 flex flex-col h-full min-h-0 rounded', {
                'opacity-60': isDragging,
                'ring-2 ring-primary/60 ring-offset-1 ring-offset-background': isDragOver,
                'w-[320px]': !isCollapsed,
                'w-10 overflow-hidden pt-4': isCollapsed,
                'bg-linear-to-b from-accent/10 to-transparent': isCollapsed,
            })}>
            
            <div className={cn('flex items-center mb-3', {
                'justify-center': isCollapsed,
                'justify-between': !isCollapsed,
            })}>
                
                <div className={cn('flex items-center gap-2', {
                    'rotate-180 [writing-mode:vertical-rl]': isCollapsed,
                    '[text-orientation:mixed] whitespace-nowrap': isCollapsed,
                })}>
                    {canManageLanes && (
                        <div
                            ref={dragHandleRef}
                            className={cn(
                                'text-muted-foreground/70 cursor-grab active:cursor-grabbing',
                                { 'hidden': isCollapsed },
                            )}>
                            <GripVertical className="h-4 w-4" />
                        </div>
                    )}
                    
                    <div className={cn(
                        'w-2 h-2 rounded-full',
                        lane.color || 'bg-black/20',
                    )} />
                    
                    {(!isCollapsed && editingLaneId === lane.id) ? (
                        <Input
                            autoFocus
                            value={editingLaneName || ''}
                            onChange={event => setEditingLaneName(event.target.value)}
                            onBlur={() => handleRenameLane(lane.id)}
                            onKeyDown={event => {
                                if (event.key === 'Enter') {
                                    event.preventDefault()
                                    event.currentTarget.blur()
                                }
                                if (event.key === 'Escape') {
                                    event.preventDefault()
                                    handleCancelRenameLane()
                                }
                            }}
                            disabled={savingLaneId === lane.id}
                            className="h-7 w-36 text-xs" />
                    ) : (
                        <>
                            <h3
                                className="text-sm font-medium text-foreground cursor-pointer"
                                onClick={() => onToggleCollapsed(lane.id)}>
                                {lane.name}
                            </h3>
                            <Badge
                                className={cn('rounded-full', { 'hidden': isCollapsed })}
                                variant="secondary">
                                {statusTasks.length}
                            </Badge>
                        </>
                    )}
                
                </div>
                
                <div className={cn('flex items-center gap-1', {
                    'hidden': isCollapsed,
                })}>
                    
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleCreateTask(lane.key)}
                        disabled={isCreating === lane.key}>
                        <Plus className="w-3 h-3" />
                    </Button>
                    
                    {canManageLanes && (
                        <ManageLaneDropdown
                            lane={lane}
                            canDeleteLane={canDeleteLane}
                            deletingLaneId={deletingLaneId}
                            handleStartRenameLane={handleStartRenameLane}
                            handleDeleteLane={handleDeleteLane} />
                    )}
                
                </div>
            
            </div>
            
            <div className={cn('flex-1 min-h-0 overflow-y-auto', {
                'hidden': isCollapsed,
            })}>
                <KanbanColumn
                    status={lane.key}
                    tasks={statusTasks}
                    teamId={teamId}
                    teamMembers={teamMembers}
                    dropIndicator={dropIndicator}
                    draggingTaskId={draggingTaskId} />
            </div>
        
        </div>
        
    )
    
}

export default KanbanTaskLane
