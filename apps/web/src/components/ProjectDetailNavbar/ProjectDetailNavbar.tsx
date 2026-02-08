import type { Project, ProjectDetailView } from '@repo/shared/types'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ThemeToggle from '@/components/ThemeToggle'
import ProjectsSelectorDropdown from '@/components/ProjectDetailNavbar/ProjectsSelectorDropdown'
import TasksSearchInput from '@/components/list/TasksSearchInput'

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
        
        <header className="flex items-center justify-between gap-8 border-b border-border px-6 py-3">
            
            <div className="flex items-center gap-3">
                
                <SidebarTrigger className="-ml-1" />
                
                <div className="flex flex-col gap-1">
                    <ProjectsSelectorDropdown
                        teamId={teamId}
                        projects={projects}
                        selectedProjectId={selectedProjectId} />
                </div>
            
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
