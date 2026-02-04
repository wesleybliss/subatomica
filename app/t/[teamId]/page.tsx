import { getTasksByTeam } from '@/lib/db/actions/tasks'
import { getTeamById } from '@/lib/db/actions/teams'
import { createProject, getProjects } from '@/lib/db/actions/projects'
import { KanbanView } from '@/components/kanban/KanbanView'
import { CreateProjectResult } from '@/types/kanban.types'

interface TeamPageProps {
    params: Promise<{ teamId: string }>
}

export default async function TeamPage({ params }: TeamPageProps) {
    const { teamId } = await params
    const createProjectAction = async (
        _prevState: CreateProjectResult,
        formData: FormData,
    ): Promise<CreateProjectResult> => {
        'use server'
        try {
            const rawName = formData.get('name')
            const name = typeof rawName === 'string' && rawName.trim()
                ? rawName.trim()
                : 'New Project'
            await createProject(name, teamId)
            return { error: null }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to create project.'
            if (message.includes('UNIQUE constraint failed'))
                return { error: 'A project with this name already exists.' }
            return { error: 'Unable to create project. Please try again.' }
        }
    }
    let team
    let tasks
    let projects
    
    try {
        ;[team, tasks, projects] = await Promise.all([
            getTeamById(teamId),
            getTasksByTeam(teamId),
            getProjects(teamId),
        ])
    } catch (error) {
        console.error('TeamPage', error)
        return <div className="p-6">Unable to load team</div>
    }
    
    if (!team)
        return <div className="p-6">Team not found</div>
    
    return (
        <KanbanView
            teamId={teamId}
            teamName={team.name}
            initialTasks={tasks}
            projects={projects}
            onCreateProject={createProjectAction}/>
    )
}
