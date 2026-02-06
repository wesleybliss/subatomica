'use client'
import useListViewGroupViewModel from '@/components/list/ListViewGroupViewModel'
import { Task, TaskLane, TeamMemberProfile } from '@repo/shared/types'
import { ListViewRow } from './ListViewRow'
import ListViewGroupHeader from '@/components/list/ListViewGroupHeader'

interface ListViewGroupProps {
    lane: TaskLane
    tasks: Task[]
    selectedTasks: Set<string>
    onToggleTask: (taskId: string) => void
    onSelectAll: (taskIds: string[]) => void
    onDeselectAll: (taskIds: string[]) => void
    teamMembers: TeamMemberProfile[]
    onTaskDelete?: (taskId: string) => void
    onTasksReorder?: (taskIds: string[], status: string) => void
}

const ListViewGroup = ({
    lane,
    tasks,
    selectedTasks,
    onToggleTask,
    onSelectAll,
    onDeselectAll,
    teamMembers,
    onTaskDelete,
    onTasksReorder,
}: ListViewGroupProps) => {
    
    const vm = useListViewGroupViewModel(tasks, selectedTasks, lane, onTasksReorder)
    
    return (
        
        <div ref={vm.groupRef} className="p-4 border-b border-border rounded">
            
            {/* Group Header */}
            <ListViewGroupHeader
                vm={vm}
                lane={lane}
                tasks={tasks}
                selectedTasks={selectedTasks}
                onToggleTask={onToggleTask}
                onSelectAll={onSelectAll}
                onDeselectAll={onDeselectAll} />
            
            {/* Group Content */}
            {vm.isExpanded && (
                <div className="divide-y divide-border">
                    {tasks.length === 0 ? (
                        <div className="px-4 py-8 text-center">
                            <p className="text-sm text-muted-foreground">
                                No tasks in this status
                            </p>
                        </div>
                    ) : (
                        tasks.map(task => (
                            <ListViewRow
                                key={task.id}
                                task={task}
                                selected={selectedTasks.has(task.id)}
                                onToggle={() => onToggleTask(task.id)}
                                teamMembers={teamMembers}
                                onDelete={onTaskDelete}/>
                        ))
                    )}
                </div>
            )}
        
        </div>
        
    )
    
}

export default ListViewGroup
