'use client'
import { KanbanColumn } from './KanbanColumnDnd'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Task, TaskStatus, TaskLane, DropIndicatorData, TeamMemberProfile } from '@/types'
import { Dispatch, SetStateAction } from 'react'

interface TaskLaneProps {
    lane: TaskLane
    tasks: Task[]
    teamId: string | undefined
    teamMembers: TeamMemberProfile[],
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
        
        <div className="shrink-0 w-[320px]">
            
            <div className="flex items-center justify-between mb-3">
                
                <div className="flex items-center gap-2">
                    
                    <div className={`w-2 h-2 rounded-full ${lane.color || 'bg-muted'}`} />
                    
                    {editingLaneId === lane.id ? (
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
                            <h3 className="text-sm font-medium text-foreground">
                                {lane.name}
                            </h3>
                            <Badge variant="secondary">
                                {statusTasks.length}
                            </Badge>
                        </>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleCreateTask(lane.key)}
                        disabled={isCreating === lane.key}>
                        <Plus className="w-3 h-3" />
                    </Button>
                    {canManageLanes && (
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                render={(
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0" />
                                )}>
                                <MoreHorizontal className="h-3.5 w-3.5" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onSelect={() => handleStartRenameLane(lane)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Rename
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onSelect={() => handleDeleteLane(lane.id)}
                                    disabled={!canDeleteLane || deletingLaneId === lane.id}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>
            <KanbanColumn
                status={lane.key}
                tasks={statusTasks}
                teamId={teamId}
                teamMembers={teamMembers}
                dropIndicator={dropIndicator}
                draggingTaskId={draggingTaskId}/>
        </div>
        
    )
    
}

export default KanbanTaskLane
