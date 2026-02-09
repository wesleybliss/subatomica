import { useWireValue } from '@forminator/react-wire'
import { Team } from '@repo/shared/types'
import { FolderKanban, LayoutGrid, Users } from 'lucide-react'
import { SyntheticEvent, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { v7 as uuidv7 } from 'uuid'

import RecentProjectsTable from '@/components/projects/RecentProjectsTable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCreateProjectMutation } from '@/lib/mutations/projects'
import { useGetProjectsQuery } from '@/lib/queries/projects.queries'
import { useGetTasksQuery } from '@/lib/queries/tasks.queries'
import { useGetTeamMembersQuery } from '@/lib/queries/teams.queries'
import * as store from '@/store'

const activeProjectsQueryKey = ['projects']

export default function TeamPage() {
    
    const params = useParams()
    const teamId = params.teamId as string
    
    const teams = useWireValue(store.teams)
    
    const team = useMemo<Team | undefined>(() => (
        teams?.find(it => it.id === teamId)
    ), [teams, teamId])
    
    const { isPending: projectsIsPending, error: projectsError, data: projects = [] } = useGetProjectsQuery(teamId)
    const { isPending: tasksIsPending, error: tasksError, data: tasks = [] } = useGetTasksQuery(teamId)
    const { isPending: teamMembersIsPending, error: teamMembersError, data: teamMembers = [] } =
        useGetTeamMembersQuery(teamId)
    
    const createProjectMutation = useCreateProjectMutation(teamId, activeProjectsQueryKey)
    
    const handleCreateProject = async (e: SyntheticEvent) => {
        
        e.preventDefault()
        
        const name = prompt('Project name', '')
        
        if (!name?.trim())
            return toast.warning('No project name provided')
        
        try {
            const tempId = uuidv7()
            await createProjectMutation.mutateAsync({ name, tempId })
        } catch (e) {
            console.error('TeamsPage#handleCreateProject', e)
            
        }
        
    }
    
    const isPending = useMemo(() => (
        projectsIsPending || tasksIsPending || teamMembersIsPending
    ), [projectsIsPending, tasksIsPending, teamMembersIsPending])
    
    if (isPending)
        return <div>@todo Loading teams...</div>
    
    if (!team)
        return <div className="p-6">Team not found</div>
    
    if (projectsError)
        return <div>Error: {projectsError.message}</div>
    
    if (tasksError)
        return <div>Error: {tasksError.message}</div>
    
    if (teamMembersError)
        return <div>Error: {teamMembersError.message}</div>
    
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
                        <Link className="text-sm" to={`/t/${teamId}/p`}>
                            View All Projects
                        </Link>
                    </div>
                    <div className="flex justify-end items-center">
                        <Link className="text-sm" to="#" onClick={handleCreateProject}>
                            New Project
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
