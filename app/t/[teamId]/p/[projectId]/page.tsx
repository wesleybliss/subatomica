import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getProjectById } from '@/lib/db/actions/projects'
import { getTasks } from '@/lib/db/actions/tasks'

export default async function NotebookPage({
    params,
}: {
    params: Promise<{ teamId: string; projectId: string }>
}) {
    
    const { teamId, projectId } = await params
    const project = await getProjectById(projectId)
    
    if (!project)
        redirect(`/t/${teamId}`)
    
    const tasks = await getTasks(projectId)
    
    return (
        
        <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 overflow-hidden bg-white">
                <div className="h-full flex items-center justify-center text-neutral-400">
                    <p>Select or create a task</p>
                </div>
            </div>
            <div className="w-64 border-l border-border bg-background p-4">
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Tasks
                </h2>
                <ul className="mt-3 space-y-2">
                    {tasks.map(task => (
                        <li key={task.id}>
                            <Link
                                href={`/t/${teamId}/p/${projectId}/s/${task.id}`}
                                className="text-sm text-foreground hover:text-primary">
                                {task.title}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}
