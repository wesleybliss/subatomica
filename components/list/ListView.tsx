'use client'
import useListViewViewModel from '@/components/list/ListViewViewModel'
import type { Project, Task, TaskLane, TeamMemberProfile } from '@/types'
import ListViewToolbar from './ListViewToolbar'
import ListViewGroup from './ListViewGroup'

interface ListViewProps {
    teamId: string
    project: Project
    tasks: Task[]
    initialLanes: TaskLane[]
    teamMembers: TeamMemberProfile[]
    selectedTasks?: Set<string>
    setSelectedTasks?: (tasks: Set<string>) => void
}

const ListView = ({
    teamId,
    project,
    tasks,
    initialLanes,
    teamMembers,
    selectedTasks: parentSelectedTasks,
    setSelectedTasks: setParentSelectedTasks,
}: ListViewProps) => {
    
    const vm = useListViewViewModel(teamId, project, tasks, initialLanes, parentSelectedTasks, setParentSelectedTasks)
    
    return (
        
        <div className="flex-1 flex flex-col overflow-hidden bg-background">
            
            {/* Toolbar */}
            <ListViewToolbar
                lanes={vm.lanes}
                selectedTasks={vm.selectedTasks}
                hasSelection={vm.hasSelection}
                handleChangeStatus={vm.handleChangeStatus}
                handleDeleteSelected={vm.handleDeleteSelected} />
            
            {/* Task List */}
            <div className="flex-1 overflow-y-auto">
                {vm.groupedTasks.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">No statuses configured</p>
                    </div>
                ) : (
                    vm.groupedTasks.map(({ lane, tasks: laneTasks }) => (
                        <ListViewGroup
                            key={lane.id}
                            lane={lane}
                            tasks={laneTasks}
                            selectedTasks={vm.selectedTasks}
                            onToggleTask={vm.handleToggleTask}
                            onSelectAll={vm.handleSelectAll}
                            onDeselectAll={vm.handleDeselectAll}
                            teamMembers={teamMembers}
                            onTaskDelete={vm.handleDeleteTask}
                            onTasksReorder={vm.handleTasksReorder}/>
                    ))
                )}
            </div>
        
        </div>
        
    )
    
}

export default ListView
