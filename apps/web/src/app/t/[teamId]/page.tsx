import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getTeamById, getTeamMembers } from '@/lib/queries/teams.queries'
import { getProjects } from '@/lib/queries/projects.queries'
import { getTasksByTeam } from '@/lib/queries/tasks.queries'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FolderKanban, LayoutGrid, Users } from 'lucide-react'
import RecentProjectsTable from '@/components/projects/RecentProjectsTable'
import { useParams } from 'react-router-dom'
import { Team, Project, TeamMemberProfile, Task } from '@repo/shared/types'

export default function TeamPage() {
    
    const params = useParams()
    const teamId = params.teamId as string
    
    const [team, setTeam] = useState<Team>()
    const [projects, setProjects] = useState<Project[]>()
    const [tasks, setTasks] = useState<Task[]>()
    const [teamMembers, setTeamMembers] = useState<TeamMemberProfile[]>()
    
    useEffect(() => {
        
        const fetchDataTodo = async () => {
            try {
                const [_team, _projects, _tasks, _teamMembers] = await Promise.all([
                    getTeamById(teamId),
                    getProjects(teamId),
                    getTasksByTeam(teamId),
                    getTeamMembers(teamId),
                ])
                setTeam(_team)
                setProjects(_projects)
                setTasks(_tasks)
                setTeamMembers(_teamMembers)
            } catch (error) {
                console.error('TeamPage', error)
                return <div className="p-6">Unable to load team</div>
            }
        }
        
    }, [teamId])
    
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
            
            <div className="mt-8 max-w-1/3 space-y-4">
                
                <header className="flex justify-between items-center gap-4">
                    <h2 className="text-lg font-semibold">
                        Recent Projects
                    </h2>
                    <div className="flex justify-end items-center">
                        <Link className="text-sm" href={`/t/${teamId}/p`}>
                            View All Projects
                        </Link>
                    </div>
                </header>
                
                <RecentProjectsTable
                    teamId={teamId}
                    projects={projects}
                    tasks={tasks} />
            
            </div>
        </div>
    )
}
