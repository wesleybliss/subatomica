import { useParams } from 'react-router-dom'
import * as store from '@/store'
import { TaskDetailForm } from '@/components/tasks/TaskDetailForm'
import { useWireValue } from '@forminator/react-wire'
import { useMemo } from 'react'

export default function TaskPage() {
    
    const params = useParams()
    
    const taskId = params.taskId as string
    const teamId = params.teamId as string
    const projectId = params.projectId as string
    
    const tasks = useWireValue(store.tasks)
    const teamMembers = useWireValue(store.teamMembers)
    
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
