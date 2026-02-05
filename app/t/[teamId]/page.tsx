import Link from 'next/link'
import { getTeamById, getTeamMembers } from '@/lib/db/actions/teams'
import { getProjects } from '@/lib/db/actions/projects'
import { getTasksByTeam } from '@/lib/db/actions/tasks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FolderKanban, LayoutGrid, Users } from 'lucide-react'

interface TeamPageProps {
    params: Promise<{ teamId: string }>
}

export default async function TeamPage({ params }: TeamPageProps) {
    const { teamId } = await params
    
    let team
    let projects
    let tasks
    let teamMembers
    
    try {
        ;[team, projects, tasks, teamMembers] = await Promise.all([
            getTeamById(teamId),
            getProjects(teamId),
            getTasksByTeam(teamId),
            getTeamMembers(teamId),
        ])
    } catch (error) {
        console.error('TeamPage', error)
        return <div className="p-6">Unable to load team</div>
    }
    
    if (!team)
        return <div className="p-6">Team not found</div>
    
    return (
        <div className="flex flex-1 flex-col p-6">
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-foreground">{team.name}</h1>
                <p className="text-sm text-muted-foreground mt-1">Team Overview</p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Projects</CardTitle>
                        <FolderKanban className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{projects.length}</div>
                        <p className="text-xs text-muted-foreground">
                            {projects.length === 1 ? 'Project' : 'Projects'} in this team
                        </p>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tasks</CardTitle>
                        <LayoutGrid className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{tasks.length}</div>
                        <p className="text-xs text-muted-foreground">
                            {tasks.length === 1 ? 'Task' : 'Tasks'} across all projects
                        </p>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Members</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{teamMembers.length}</div>
                        <p className="text-xs text-muted-foreground">
                            {teamMembers.length === 1 ? 'Member' : 'Members'} in team
                        </p>
                    </CardContent>
                </Card>
            </div>
            
            <div className="mt-8 space-y-4">
                <h2 className="text-lg font-semibold">Quick Links</h2>
                <div className="flex gap-4">
                    <Link
                        href={`/t/${teamId}/p`}
                        className="inline-flex items-center justify-center rounded-md bg-primary
                            px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                        View All Projects
                    </Link>
                    {projects.length > 0 && (
                        <Link
                            href={`/t/${teamId}/p/${projects[0].id}`}
                            className="inline-flex items-center justify-center rounded-md border
                                border-input bg-background px-4 py-2 text-sm font-medium
                                hover:bg-accent hover:text-accent-foreground">
                            Open First Project
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}
