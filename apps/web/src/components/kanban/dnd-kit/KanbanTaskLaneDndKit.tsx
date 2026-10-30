import { useDraggable, useDroppable } from '@dnd-kit/core'
import type { Task, TaskLane, TaskStatus, TeamMemberProfile } from '@repo/shared/types'
import { GripVertical, Plus } from 'lucide-react'
import type { Dispatch, SetStateAction } from 'react'
import { useCallback, useMemo } from 'react'

import ManageLaneDropdown from '@/components/kanban/ManageLaneDropdown'
import LaneIconColorPicker from '@/components/lanes/LaneIconColorPicker'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import useLaneColor from '@/hooks/useLaneColor'
import { cn } from '@/lib/utils'

import { KanbanColumnDndKit } from './KanbanColumnDndKit'

type KanbanTaskLaneDndKitProps = {
    lane: TaskLane
    tasks: Task[]
    teamId: string | undefined
    teamMembers: TeamMemberProfile[]
    isCollapsed: boolean
    onToggleCollapsed: (laneId: string) => void
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
    handleLaneColorChange: (laneId: string, hex: string) => void
}

export const KanbanTaskLaneDndKit = ({
    lane,
    tasks = [],
    teamId,
    teamMembers,
    isCollapsed,
    onToggleCollapsed,
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
    handleLaneColorChange,
}: KanbanTaskLaneDndKitProps) => {
    const laneColor = useLaneColor(lane.color ?? '')
    
    // Lane DnD lives on the header only — never wrap the whole lane. That way
    // lane droppables can't steal task collisions, and we avoid useDndContext
    // (which re-renders every lane on every pointer sample).
    const laneData = useMemo(
        () => ({ type: 'lane' as const, laneId: lane.id }),
        [lane.id],
    )
    
    const {
        attributes,
        listeners,
        setNodeRef: setDragRef,
        isDragging,
    } = useDraggable({
        id: `lane:${lane.id}`,
        data: laneData,
        disabled: !canManageLanes,
    })
    
    const { setNodeRef: setDropRef, isOver } = useDroppable({
        id: `lane-drop:${lane.id}`,
        data: laneData,
        disabled: !canManageLanes,
    })
    
    const setHeaderRef = useCallback((node: HTMLElement | null) => {
        setDragRef(node)
        setDropRef(node)
    }, [setDragRef, setDropRef])
    
    return (
        <div
            data-testid="TaskLane"
            className={cn('shrink-0 flex flex-col h-full min-h-0 rounded ring-2 p-2', laneColor.tailwindBackground, {
                'bg-primary/5 ring-primary/20': !isDragging && !isOver
                    && !isCollapsed && !laneColor.backgroundColor,
                'opacity-60': isDragging,
                'ring-2': !isOver,
                'ring-primary/60 ring-offset-1 ring-offset-background': isOver,
                'w-[320px]': !isCollapsed,
                'w-10 overflow-hidden pt-4': isCollapsed,
                'bg-linear-to-b from-accent/70 to-transparent': isCollapsed,
            })}
            style={laneColor.styles}>
            
            <div
                ref={setHeaderRef}
                className={cn('flex items-center mb-3', {
                    'justify-center': isCollapsed,
                    'justify-between': !isCollapsed,
                })}>
                <div className={cn('flex items-center gap-2', {
                    'rotate-180 [writing-mode:vertical-rl]': isCollapsed,
                    '[text-orientation:mixed] whitespace-nowrap': isCollapsed,
                })}>
                    {canManageLanes && (
                        <div
                            {...listeners}
                            {...attributes}
                            className={cn(
                                'text-muted-foreground/70 cursor-grab active:cursor-grabbing',
                                { 'hidden': isCollapsed },
                            )}>
                            <GripVertical className="h-4 w-4" />
                        </div>
                    )}
                    
                    <LaneIconColorPicker
                        lane={lane}
                        iconSize={isCollapsed ? 16 : 18}
                        onColorChange={
                            canManageLanes
                                ? hex => handleLaneColorChange(lane.id, hex)
                                : undefined
                        }
                        onTriggerClick={e => e.stopPropagation()} />
                    
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
                                {tasks.length}
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
                <KanbanColumnDndKit
                    status={lane.key}
                    tasks={tasks}
                    teamId={teamId}
                    teamMembers={teamMembers} />
            </div>
        </div>
    )
}
