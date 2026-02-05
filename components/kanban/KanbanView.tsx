'use client'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Project, Task, TaskLane, TeamMemberProfile } from '@/types'
import KanbanBoardDnd from './KanbanBoardDnd'
import { useQuery } from '@tanstack/react-query'

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
    
    const tasksQueryKey = useMemo(() => (
        ['tasks', { teamId, projectId }] as const
    ), [teamId, projectId])
    
    const { data: tasks = initialTasks } = useQuery({
        queryKey: tasksQueryKey,
        queryFn: async () => {
            const params = new URLSearchParams({ teamId, projectId })
            const response = await fetch(`/api/tasks?${params.toString()}`)
            if (!response.ok)
                throw new Error('Failed to fetch tasks')
            return await response.json() as Promise<Task[]>
        },
        initialData: initialTasks,
    })
    
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
