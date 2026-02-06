import { getProjects } from '@/lib/db/actions/projects'
import { getTasksByTeam } from '@/lib/db/actions/tasks'
import { TimelineView } from '@/components/timeline/TimelineView'

export default async function TeamViewsPage({
    params,
}: {
    params: Promise<{ teamId: string }>
}) {
    const { teamId } = await params
    const [projects, tasks] = await Promise.all([
        getProjects(teamId),
        getTasksByTeam(teamId),
    ])
    return (
        <TimelineView projects={projects} tasks={tasks} />
    )
}
