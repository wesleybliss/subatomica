import { useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { TaskDetailForm } from '@/components/tasks/TaskDetailForm'
import { useTaskStore, useTeamStore } from '@/store'

export default function TaskPage() {
    
    const params = useParams()
    
    const taskId = params.taskId as string
    const teamId = params.teamId as string
    const projectId = params.projectId as string
    
    const tasks = useTaskStore(s => s.tasks)
    const teamMembers = useTeamStore(s => s.teamMembers)
    
    const task = useMemo(() => (
        tasks?.find(it => it.id === taskId)
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
