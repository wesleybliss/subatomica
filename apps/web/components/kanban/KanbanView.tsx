'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Project, Task, TaskLane, TeamMemberProfile } from '@repo/shared/types'
import KanbanBoardDnd from './KanbanBoardDnd'

interface KanbanViewProps {
    teamId: string
    project: Project
    tasks: Task[]
    initialLanes: TaskLane[]
    teamMembers: TeamMemberProfile[]
    tasksQueryKey: readonly ['tasks', {
        readonly teamId: string;
        readonly projectId: string;
    }]
}

const KanbanView = ({
    teamId,
    project,
    tasks,
    initialLanes,
    teamMembers,
    tasksQueryKey,
}: KanbanViewProps) => {
    
    const router = useRouter()
    const projectId = project.id
    
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
