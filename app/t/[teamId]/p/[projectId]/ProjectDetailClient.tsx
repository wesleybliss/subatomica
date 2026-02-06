'use client'
import { useState } from 'react'
import type { Project, Task, TaskLane, TeamMemberProfile } from '@/types'
import KanbanView from '@/components/kanban/KanbanView'
import TimelineView from '@/components/timeline/TimelineView'
import ListView from '@/components/list/ListView'
import ProjectDetailNavbar from '@/components/ProjectDetailNavbar'

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
    
    return (
        
        <div className="flex h-full flex-col">
            
            <ProjectDetailNavbar
                teamId={teamId}
                projects={projects}
                selectedProjectId={project.id}
                activeView={activeView}
                onViewChange={setActiveView} />
            
            {activeView === 'list' ? (
                <ListView
                    teamId={teamId}
                    project={project}
                    initialTasks={initialTasks}
                    initialLanes={initialLanes}
                    teamMembers={teamMembers} />
            ) : activeView === 'kanban' ? (
                <KanbanView
                    teamId={teamId}
                    project={project}
                    initialTasks={initialTasks}
                    initialLanes={initialLanes}
                    teamMembers={teamMembers} />
            ) : (
                <div className="flex-1 overflow-hidden">
                    <TimelineView projects={[project]} tasks={initialTasks} />
                </div>
            )}
        
        </div>
        
    )
    
}
