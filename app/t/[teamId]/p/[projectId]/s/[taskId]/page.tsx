import { redirect } from 'next/navigation'
import { getProjectById, getTaskById } from '@/lib/constants'

export default async function NotePage({
    params,
}: {
    params: Promise<{ teamId: string; projectId: string; taskId: string }>
}) {
    const { teamId, projectId, taskId } = await params
    const project = getProjectById(projectId)
    
    if (!project)
        redirect(`/t/${teamId}`)
    
    const task = getTaskById(taskId)
    
    if (!task)
        redirect(`/t/${teamId}/p/${projectId}`)
    
    return (
        
        <div className="flex flex-1 overflow-hidden">
            
            <h1>{task.title}</h1>
            
            <div className="flex-1 overflow-hidden bg-white">
                TODO: task detail
            </div>
        
        </div>
    )
}
