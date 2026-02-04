import { getTasksByTeam } from '@/lib/db/actions/tasks'
import { getTeamById } from '@/lib/db/actions/teams'
import { getProjects } from '@/lib/db/actions/projects'
import { KanbanView } from '@/components/kanban/KanbanView'

interface TeamPageProps {
    params: Promise<{ teamId: string }>
}

export default async function TeamPage({ params }: TeamPageProps) {
    const { teamId } = await params
    
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
        />
    )
}
