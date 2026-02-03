import { redirect } from 'next/navigation'
import { getProjectById, getTasksByProjectId } from '@/lib/constants'

export default async function NotebookPage({
    params,
}: {
    params: Promise<{ teamId: string; projectId: string }>
}) {
    const { teamId, projectId } = await params
    const project = getProjectById(projectId)

    if (!project)
        redirect(`/t/${teamId}`)

    const tasks = getTasksByProjectId(projectId)

    return (
        <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 overflow-hidden bg-white">
                <div className="h-full flex items-center justify-center text-neutral-400">
                    <p>Select or create a task</p>
                </div>
            </div>
        </div>
    )
}
