import { redirect } from 'next/navigation'
import { getProjectById } from '@/lib/db/actions/projects'
import { getTask } from '@/lib/db/actions/tasks'
import { getTeamMembers } from '@/lib/db/actions/teams'
import { TaskDetailForm } from '@/components/tasks/TaskDetailForm'

export default async function NotePage({
    params,
}: {
    params: Promise<{ teamId: string; projectId: string; taskId: string }>
}) {
    const { teamId, projectId, taskId } = await params
    const project = await getProjectById(projectId)
    if (!project)
        redirect(`/t/${teamId}`)
    const task = await getTask(taskId)
    if (!task)
        redirect(`/t/${teamId}/p/${projectId}`)
    const teamMembers = await getTeamMembers(teamId)
    return (
        <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 overflow-hidden bg-background p-6">
                <TaskDetailForm task={task} teamMembers={teamMembers} />
            </div>
        </div>
    )
}
