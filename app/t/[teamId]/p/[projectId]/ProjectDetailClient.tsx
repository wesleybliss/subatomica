'use client'
import { useMemo, useState } from 'react'
import type { Project, Task, TaskLane, TeamMemberProfile } from '@/types'
import KanbanView from '@/components/kanban/KanbanView'
import TimelineView from '@/components/timeline/TimelineView'
import ListView from '@/components/list/ListView'
import ProjectDetailNavbar from '@/components/ProjectDetailNavbar'
import useDebounce from '@/hooks/useDebounce'
import useTasksQuery from '@/lib/queries/useTasksQuery'

interface ProjectDetailClientProps {
    teamId: string
    project: Project
    initialTasks: Task[]
    initialLanes: TaskLane[]
    teamMembers: TeamMemberProfile[]
    projects: Project[]
}

export function ProjectDetailClient({
    teamId,
    project,
    initialTasks,
    initialLanes,
    teamMembers,
    projects,
}: ProjectDetailClientProps) {
    
    const [activeView, setActiveView] = useState<'kanban' | 'timeline' | 'list'>('kanban')
    const [tasksQuery, setTasksQuery] = useState<string>('')
    
    const { tasksQueryKey, data: tasks = initialTasks } = useTasksQuery(teamId, project.id, initialTasks)
    
    const tasksQueryDebounced = useDebounce(tasksQuery, 1200)
    
    const filteredTasks = useMemo(() => {
        
        if (!tasksQuery.length)
            return tasks
        
        return tasks.filter(it => it.title
            .toLowerCase()
            .includes(tasksQueryDebounced.toLowerCase()))
        
    }, [tasks, tasksQueryDebounced])
    
    return (
        
        <div className="flex h-full flex-col">
            
            <ProjectDetailNavbar
                teamId={teamId}
                projects={projects}
                selectedProjectId={project.id}
                activeView={activeView}
                onViewChange={setActiveView}
                tasksQuery={tasksQuery}
                setTasksQuery={setTasksQuery} />
            
            {activeView === 'list' ? (
                <ListView
                    teamId={teamId}
                    project={project}
                    tasks={filteredTasks}
                    initialLanes={initialLanes}
                    teamMembers={teamMembers} />
            ) : activeView === 'kanban' ? (
                <KanbanView
                    teamId={teamId}
                    project={project}
                    tasks={filteredTasks}
                    initialLanes={initialLanes}
                    teamMembers={teamMembers}
                    tasksQueryKey={tasksQueryKey} />
            ) : (
                <div className="flex-1 overflow-hidden">
                    <TimelineView projects={[project]} tasks={initialTasks} />
                </div>
            )}
        
        </div>
        
    )
    
}
