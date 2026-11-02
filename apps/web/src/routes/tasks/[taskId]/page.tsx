import { useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { TaskDetailForm } from '@/components/tasks/TaskDetailForm'
import { useTasks } from '@/lib/queries/tasks.queries'
import { useGetTeamMembersQuery } from '@/lib/queries/teams.queries'

export default function TaskPage() {
    
    const params = useParams()
    
    const taskId = params.taskId as string
    const teamId = params.teamId as string
    const projectId = params.projectId as string
    
    const tasks = useTasks(teamId, projectId)
    const { data: teamMembers = [] } = useGetTeamMembersQuery(teamId)
    
    const task = useMemo(() => (
        tasks.find(it => it.id === taskId)
    ), [tasks, taskId])
    
    if (!task)
        return <div>@todo no task</div>
    
    return (
        <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 overflow-hidden bg-background p-6">
                <TaskDetailForm task={task} teamId={teamId} teamMembers={teamMembers} projectId={projectId} />
            </div>
        </div>
    )
}
