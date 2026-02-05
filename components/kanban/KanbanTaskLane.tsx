'use client'
import { KanbanColumn } from './KanbanColumnDnd'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Task, TaskStatus, TaskLane, DropIndicatorData, TeamMemberProfile } from '@/types'
import { Dispatch, SetStateAction } from 'react'
import ManageLaneDropdown from '@/components/kanban/ManageLaneDropdown'
import { cn } from '@/lib/utils'

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
}: TaskLaneProps) => {
    
    const statusTasks = tasks
        .filter(t => t.status === lane.key)
        .sort((a, b) => a.order - b.order)
    
    return (
        
        <div className={cn('shrink-0 flex flex-col h-full min-h-0 rounded', {
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
