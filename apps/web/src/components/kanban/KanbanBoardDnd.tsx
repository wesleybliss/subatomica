import { Task, TaskLane, TeamMemberProfile } from '@repo/shared/types'
import { Plus } from 'lucide-react'

import useKanbanBoardDndViewModel from '@/components/kanban/KanbanBoardDndViewModel'
import KanbanTaskLane from '@/components/kanban/KanbanTaskLane'
import { Button } from '@/components/ui/button'

export interface KanbanBoardProps {
    tasks: Task[]
    lanes: TaskLane[]
    projectId?: string
    teamId?: string
    teamMembers: TeamMemberProfile[]
    onRefresh?: () => void
    queryKey?: ReadonlyArray<string | number | boolean | undefined | Record<string, unknown>>
    onLanesChange?: (lanes: TaskLane[]) => void
}

const KanbanBoardDnd = ({
    tasks,
    lanes,
    projectId,
    teamId,
    teamMembers,
    onRefresh,
    queryKey,
    onLanesChange,
}: KanbanBoardProps) => {
    
    const vm = useKanbanBoardDndViewModel(
        lanes,
        tasks,
        teamId,
        projectId,
        queryKey,
        onRefresh,
        onLanesChange,
    )
    
    return (
        
        <div
            data-testid="KanbanBoardDnD"
            className="flex gap-4 h-full overflow-x-auto overflow-y-hidden pt-1 pb-4 px-1">
            
            {vm.localLanes.map((it: TaskLane) => (
                <KanbanTaskLane
                    key={it.id}
                    lane={it}
                    tasks={vm.tasksByStatus[it.key]}
                    teamId={teamId}
                    teamMembers={teamMembers}
                    isCollapsed={vm.taskLanes.collapsedLanes.includes(it.id)}
                    onToggleCollapsed={vm.taskLanes.handleToggleCollapsed}
                    editingLaneId={vm.taskLanes.editingLaneId}
                    editingLaneName={vm.taskLanes.editingLaneName}
                    setEditingLaneName={vm.taskLanes.setEditingLaneName}
                    isCreating={vm.isCreating}
                    savingLaneId={vm.taskLanes.savingLaneId}
                    canManageLanes={vm.taskLanes.canManageLanes}
                    canDeleteLane={vm.taskLanes.canDeleteLane}
                    deletingLaneId={vm.taskLanes.deletingLaneId}
                    handleCreateTask={vm.handleCreateTask}
                    handleStartRenameLane={vm.taskLanes.handleStartRenameLane}
                    handleRenameLane={vm.taskLanes.handleRenameLane}
                    handleCancelRenameLane={vm.taskLanes.handleCancelRenameLane}
                    handleDeleteLane={vm.taskLanes.handleDeleteLane}
                    handleReorderLane={vm.taskLanes.handleReorderLane}
                    handleLaneColorChange={vm.taskLanes.handleLaneColorChange} />
            ))}
            
            {vm.taskLanes.canManageLanes && (
                <div className="shrink-0 flex flex-col w-8 h-full min-h-0 rounded overflow-hidden pt-8">
                    
                    <div className="flex items-center w-full mb-3 justify-center">
                        
                        <div className="flex items-center gap-2 w-full
                            rotate-180 [writing-mode:vertical-rl]
                            [text-orientation:mixed] whitespace-nowrap">
                            
                            <Button
                                className="w-full h-full text-xs"
                                variant="outline"
                                onClick={vm.taskLanes.handleAddLane}
                                disabled={vm.taskLanes.isAddingLane}>
                                <Plus className="size-4" />
                                Add lane
                            </Button>
                        
                        </div>
                    
                    </div>
                
                </div>
            )}
        </div>
        
    )
    
}

export default KanbanBoardDnd
