import { getTasksByTeam } from '@/lib/db/actions/tasks'
import { getTeamById, getTeamMembers } from '@/lib/db/actions/teams'
import { createProject, getProjects } from '@/lib/db/actions/projects'
import { getProjectLanes } from '@/lib/db/actions/lanes'
import { KanbanView } from '@/components/kanban/KanbanView'
import { CreateProjectResult } from '@/types/kanban.types'
import type { TaskLane, TeamMemberProfile } from '@/types'

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
    let lanes: TaskLane[] = []
    let teamMembers: TeamMemberProfile[] = []
    
    try {
        ;[team, tasks, projects, teamMembers] = await Promise.all([
            getTeamById(teamId),
            getTasksByTeam(teamId),
            getProjects(teamId),
            getTeamMembers(teamId),
        ])
        lanes = projects.length > 0
            ? await getProjectLanes(projects[0].id)
            : []
    } catch (error) {
        console.error('TeamPage', error)
        return <div className="p-6">Unable to load team</div>
    }
    
    if (!team)
        return <div className="p-6">Team not found</div>
    
    return (
        <KanbanView
            teamId={teamId}
            initialTasks={tasks}
            projects={projects}
            initialLanes={lanes}
            teamMembers={teamMembers}
            onCreateProject={createProjectAction}/>
    )
}
