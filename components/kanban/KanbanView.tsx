'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Project, Task, TaskLane, TeamMemberProfile } from '@/types'
import KanbanBoardDnd from './KanbanBoardDnd'
import useTasksQuery from '@/lib/queries/useTasksQuery'

interface KanbanViewProps {
    teamId: string
    project: Project
    initialTasks: Task[]
    initialLanes: TaskLane[]
    teamMembers: TeamMemberProfile[]
}

const KanbanView = ({
    teamId,
    project,
    initialTasks,
    initialLanes,
    teamMembers,
}: KanbanViewProps) => {
    
    const router = useRouter()
    const projectId = project.id
    
    const { tasksQueryKey, data: tasks = initialTasks } = useTasksQuery(teamId, projectId, initialTasks)
    
    const [lanes, setLanes] = useState<TaskLane[]>(initialLanes)
    
    useEffect(() => {
        setLanes(initialLanes)
    }, [initialLanes])
    
    return (
        
        <div className="flex-1 overflow-hidden px-6 py-5">
            
            <KanbanBoardDnd
                tasks={tasks}
                lanes={lanes}
                projectId={projectId}
                teamId={teamId}
                teamMembers={teamMembers}
                queryKey={tasksQueryKey}
                onLanesChange={setLanes}
                onRefresh={() => router.refresh()} />
        
        </div>
        
    )
    
}

export default KanbanView
