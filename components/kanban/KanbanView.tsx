'use client'
import { useActionState, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Project, Task } from '@/types'
import type { CreateProjectResult } from '@/types/kanban.types'
import { KanbanBoardDnd } from './KanbanBoardDnd'
import { FolderPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface KanbanViewProps {
    teamId: string
    teamName: string
    initialTasks: Task[]
    projects: Project[]
    onCreateProject?: (
        prevState: CreateProjectResult,
        formData: FormData,
    ) => Promise<CreateProjectResult>
}

export function KanbanView({
    teamId,
    teamName,
    initialTasks,
    projects,
    onCreateProject,
}: KanbanViewProps) {
    const router = useRouter()
    const [selectedProjectId] = useState(
        projects[0]?.id ?? 'all',
    )
    const filteredTasks = useMemo(() => {
        if (selectedProjectId === 'all') return initialTasks
        return initialTasks.filter(task => task.projectId === selectedProjectId)
    }, [initialTasks, selectedProjectId])
    const canCreateTask = selectedProjectId !== 'all'
    const canCreateProject = Boolean(onCreateProject)
    const [createProjectState, createProjectAction, isCreatingProject] = useActionState(
        onCreateProject ?? (async (state: CreateProjectResult) => state),
        { error: null },
    )
    return (
        <div className="flex h-full flex-col">
            <header className="flex items-center justify-between border-b border-border px-6 py-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-sm font-semibold text-foreground">
                        {teamName}
                    </h1>
                </div>
            </header>
            <div className="flex-1 overflow-hidden px-6 py-5">
                {projects.length === 0 ? (
                    <div className="flex flex-col gap-8 h-full items-center
                        justify-center text-sm text-muted-foreground">
                        <div>Create a project to start tracking tasks.</div>
                        <form action={createProjectAction}>
                            <input type="hidden" name="name" value="New Project" />
                            <Button type="submit" disabled={!canCreateProject || isCreatingProject}>
                                <FolderPlus />
                                Create Project
                            </Button>
                            {createProjectState.error && (
                                <p className="mt-2 text-xs text-destructive">
                                    {createProjectState.error}
                                </p>
                            )}
                        </form>
                    </div>
                ) : (
                    <KanbanBoardDnd
                        tasks={filteredTasks}
                        projectId={canCreateTask ? selectedProjectId : undefined}
                        teamId={teamId}
                        onRefresh={() => router.refresh()}/>
                )}
            </div>
        </div>
    )
}
