import { useWireValue } from '@forminator/react-wire'
import * as store from '@/store'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FolderKanban, LayoutGrid } from 'lucide-react'

export default function TeamProjectsPage() {
    
    const team = useWireValue(store.selectedTeam)
    
    const projects = useWireValue(store.projects)
    const tasks = useWireValue(store.tasks)
    
    const getTaskCountForProject = (projectId: string) =>
        tasks.filter(task => task.projectId === projectId).length
    
    if (!team) return <div className="p-6">Loading...</div>
    
    return (
        
        <div className="flex flex-1 flex-col p-6">
            
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-foreground">Projects</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    {projects.length} {projects.length === 1 ? 'project' : 'projects'} in {team.name}
                </p>
            </div>
            
            {projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-muted p-4 mb-4">
                        <FolderKanban className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground">No projects yet</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                        Get started by creating a project from the team overview page.
                    </p>
                    <Link
                        href={`/t/${team.id}`}
                        className="mt-4 inline-flex items-center justify-center rounded-md border border-input
                            bg-background px-4 py-2 text-sm font-medium hover:bg-accent
                            hover:text-accent-foreground">
                        Go to Team Overview
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {projects.map(project => {
                        const taskCount = getTaskCountForProject(project.id)
                        return (
                            <Link key={project.id} href={`/t/${team.id}/p/${project.id}`}>
                                <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium line-clamp-1">
                                            {project.name}
                                        </CardTitle>
                                        <FolderKanban className="h-4 w-4 text-muted-foreground shrink-0" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1.5">
                                                <LayoutGrid className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span className="text-sm text-muted-foreground">
                                                    {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
                                                </span>
                                            </div>
                                        </div>
                                        {project.description && (
                                            <p className="text-xs text-muted-foreground mt-3 line-clamp-2">
                                                {project.description}
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            </Link>
                        )
                    })}
                </div>
            )}
        
        </div>
        
    )
    
}
