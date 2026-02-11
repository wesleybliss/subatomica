import type { Project, Task, TaskLane, TeamMemberProfile } from '@repo/shared/types'
import { useState } from 'react'

import KanbanBoardDnd from './KanbanBoardDnd'

interface KanbanViewProps {
    teamId: string
    project: Project
    tasks: Task[]
    initialLanes: TaskLane[]
    teamMembers: TeamMemberProfile[]
    tasksQueryKey: readonly ['tasks', string, string | undefined]
}

const KanbanView = ({
    teamId,
    project,
    tasks,
    initialLanes,
    teamMembers,
    tasksQueryKey,
}: KanbanViewProps) => {
    
    const projectId = project.id
    
    const [lanes, setLanes] = useState<TaskLane[]>(initialLanes)
    
    // Group tasks by status
    const tasksByStatus = tasks.reduce((acc, task) => {
        if (!acc[task.status])
            acc[task.status] = []
        console.log(task.title, '->', task.status)
        acc[task.status].push(task)
        return acc
    }, {} as Record<string, Task[]>)
    
    // Update column counts
    const columnsWithCounts = lanes.map(it => ({
        ...it,
        count: tasksByStatus[it.key]?.length || 0,
    }))
    
    /*useEffect(() => {
        setLanes(initialLanes)
    }, [initialLanes])*/
    
    return (
        
        <div className="flex-1 overflow-hidden px-6 py-5">
            
            <KanbanBoardDnd
                tasks={tasks}
                lanes={lanes}
                projectId={projectId}
                teamId={teamId}
                teamMembers={teamMembers}
                queryKey={tasksQueryKey}
                onLanesChange={setLanes} />
        
        </div>
        
    )
    
}

export default KanbanView
