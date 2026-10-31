import type { Project, Task, TaskLane, TeamMemberProfile } from '@repo/shared/types'
import { useCallback, useMemo, useState } from 'react'

import KanbanView from '@/components/kanban/KanbanView'
import ListView from '@/components/list/ListView'
import ProjectDetailNavbar from '@/components/ProjectDetailNavbar'
import { useSyncScope } from '@/components/sync/SyncProvider'
import TimelineView from '@/components/timeline/TimelineView'
import { useGetTasksQuery } from '@/lib/queries/tasks.queries'

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
    const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set())
    
    const { tasksQueryKey, data: tasks = initialTasks } = useGetTasksQuery(teamId, project.id)
    
    useSyncScope(teamId, project.id)
    
    const setTasksQueryAndClearSelection = useCallback((value: string) => {
        setTasksQuery(value)
        if (!value.length)
            setSelectedTasks(new Set())
    }, [])
    
    const filteredTasks = useMemo(() => {
        if (!tasksQuery.length)
            return tasks
        
        const query = tasksQuery.trim().toLowerCase()
        
        if (!query)
            return tasks
        
        return tasks.filter(it => it.title
            .toLowerCase()
            .includes(query))
    }, [tasks, tasksQuery])
    
    return (
        
        <div
            data-testid="ProjectDetailClient"
            className="flex h-full flex-col">
            
            <ProjectDetailNavbar
                teamId={teamId}
                projects={projects}
                selectedProjectId={project.id}
                activeView={activeView}
                onViewChange={setActiveView}
                tasksQuery={tasksQuery}
                setTasksQuery={setTasksQueryAndClearSelection} />
            
            {activeView === 'list' ? (
                <ListView
                    teamId={teamId}
                    project={project}
                    tasks={filteredTasks}
                    initialLanes={initialLanes}
                    teamMembers={teamMembers}
                    selectedTasks={selectedTasks}
                    setSelectedTasks={setSelectedTasks} />
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
