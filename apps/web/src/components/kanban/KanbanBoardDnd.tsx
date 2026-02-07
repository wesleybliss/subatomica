import { Link } from 'react-router-dom'
import { Task, TaskLane, TeamMemberProfile } from '@repo/shared/types'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import KanbanTaskLane from '@/components/kanban/KanbanTaskLane'
import useKanbanBoardDndViewModel from '@/components/kanban/KanbanBoardDndViewModel'

export interface KanbanBoardProps {
    tasks: Task[]
    lanes: TaskLane[]
    projectId?: string
    teamId?: string
    teamMembers: TeamMemberProfile[]
    onRefresh?: () => void
    queryKey?: ReadonlyArray<string | number | boolean | Record<string, unknown>>
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
        projectId,
        queryKey,
        onRefresh,
        onLanesChange,
    )
    
    return (
        
        <div className="flex gap-4 h-full overflow-x-auto overflow-y-hidden pb-4">
            
            {lanes.map(it => (
                <KanbanTaskLane
                    key={it.id}
                    lane={it}
                    tasks={tasks}
                    teamId={teamId}
                    teamMembers={teamMembers}
                    isCollapsed={vm.collapsedLanes.includes(it.id)}
                    onToggleCollapsed={vm.handleToggleCollapsed}
                    dropIndicator={vm.dropIndicator}
                    draggingTaskId={vm.draggingTaskId}
                    editingLaneId={vm.editingLaneId}
                    editingLaneName={vm.editingLaneName}
                    setEditingLaneName={vm.setEditingLaneName}
                    isCreating={vm.isCreating}
                    savingLaneId={vm.savingLaneId}
                    canManageLanes={vm.canManageLanes}
                    canDeleteLane={vm.canDeleteLane}
                    deletingLaneId={vm.deletingLaneId}
                    handleCreateTask={vm.handleCreateTask}
                    handleStartRenameLane={vm.handleStartRenameLane}
                    handleRenameLane={vm.handleRenameLane}
                    handleCancelRenameLane={vm.handleCancelRenameLane}
                    handleDeleteLane={vm.handleDeleteLane} />
            ))}
            
            {vm.canManageLanes && (
                <div className="shrink-0 flex flex-col w-8 h-full min-h-0 rounded overflow-hidden pt-8">
                    
                    <div className="flex items-center w-full mb-3 justify-center">
                        
                        <div className="flex items-center gap-2 w-full
                            rotate-180 [writing-mode:vertical-rl]
                            [text-orientation:mixed] whitespace-nowrap">
                            
                            <Button
                                className="w-full h-full text-xs"
                                variant="outline"
                                onClick={vm.handleAddLane}
                                disabled={vm.isAddingLane}>
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
