'use client'
import useListViewViewModel from '@/components/list/ListViewViewModel'
import type { Project, Task, TaskLane, TeamMemberProfile } from '@/types'
import ListViewGroup from './ListViewGroup'
import { Button } from '@/components/ui/button'
import { Trash2, Tag } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ListViewProps {
    teamId: string
    project: Project
    initialTasks: Task[]
    initialLanes: TaskLane[]
    teamMembers: TeamMemberProfile[]
}

const ListView = ({
    teamId,
    project,
    initialLanes,
    initialTasks,
    teamMembers,
}: ListViewProps) => {
    
    const vm = useListViewViewModel(teamId, project, initialLanes, initialTasks)
    
    return (
        
        <div className="flex-1 flex flex-col overflow-hidden bg-background">
            
            {/* Toolbar */}
            {vm.hasSelection && (
                <div className="border-b border-border px-6 py-3 flex items-center justify-between bg-muted/20">
                    <span className="text-sm font-medium text-foreground">
                        {vm.selectedTasks.size} selected
                    </span>
                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                render={
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-2">
                                        <Tag className="w-4 h-4" />
                                    Change Status
                                    </Button>
                                }/>
                            <DropdownMenuContent align="end">
                                {vm.lanes.map(lane => (
                                    <DropdownMenuItem
                                        key={lane.id}
                                        onClick={() => vm.handleChangeStatus(lane.key)}>
                                        {lane.name}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button
                            variant="destructive"
                            size="sm"
                            className="gap-2"
                            onClick={vm.handleDeleteSelected}>
                            <Trash2 className="w-4 h-4" />
                            Delete
                        </Button>
                    </div>
                </div>
            )}
            
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
