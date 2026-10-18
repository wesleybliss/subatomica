import type { Project, ProjectDetailView } from '@repo/shared/types'

import TasksSearchInput from '@/components/list/TasksSearchInput'
import ProjectsSelectorDropdown from '@/components/ProjectDetailNavbar/ProjectsSelectorDropdown'
import ThemeToggle from '@/components/ThemeToggle'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface ProjectDetailNavbarProps {
    teamId: string
    projects: Project[]
    selectedProjectId: string
    activeView: ProjectDetailView
    onViewChange: (view: ProjectDetailView) => void
    tasksQuery: string
    setTasksQuery: (value: string) => void
}

const ProjectDetailNavbar = ({
    teamId,
    projects,
    selectedProjectId,
    activeView,
    onViewChange,
    tasksQuery,
    setTasksQuery,
}: ProjectDetailNavbarProps) => {
    
    return (
        
        <header className="flex h-14 items-center justify-between gap-6 border-b border-border px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger />
                <ProjectsSelectorDropdown
                    teamId={teamId}
                    projects={projects}
                    selectedProjectId={selectedProjectId} />
            </div>
            
            <Tabs
                value={activeView}
                onValueChange={value => onViewChange(value as ProjectDetailView)}
                className="w-auto">
                <TabsList>
                    <TabsTrigger value="list">List</TabsTrigger>
                    <TabsTrigger value="kanban">Kanban</TabsTrigger>
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                </TabsList>
            </Tabs>
            
            <div className="flex-1">
                <TasksSearchInput
                    tasksQuery={tasksQuery}
                    setTasksQuery={setTasksQuery} />
            </div>
            
            <ThemeToggle />
        
        </header>
        
    )
    
}

export default ProjectDetailNavbar
