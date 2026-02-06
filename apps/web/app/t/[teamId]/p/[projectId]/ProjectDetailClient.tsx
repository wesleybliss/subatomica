'use client'
import { useEffect, useMemo, useState } from 'react'
import type { Project, Task, TaskLane, TeamMemberProfile } from '@repo/shared/types'
import KanbanView from '@/components/kanban/KanbanView'
import TimelineView from '@/components/timeline/TimelineView'
import ListView from '@/components/list/ListView'
import ProjectDetailNavbar from '@/components/ProjectDetailNavbar'
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
    const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set())
    
    const { tasksQueryKey, data: tasks = initialTasks } = useTasksQuery(teamId, project.id, initialTasks)
    
    useEffect(() => {
        if (!tasksQuery.length) {
            setSelectedTasks(new Set())
        }
    }, [tasksQuery])
    
    const filteredTasks = useMemo(() => {
        if (!tasksQuery.length) {
            return tasks
        }
        
        const query = tasksQuery.toLowerCase()
        return tasks.filter(it => it.title
            .toLowerCase()
            .includes(query))
    }, [tasks, tasksQuery])
    
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
