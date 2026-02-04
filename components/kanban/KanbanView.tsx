'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Project, Task } from '@/types'
import { KanbanBoardDnd } from './KanbanBoardDnd'

interface KanbanViewProps {
    teamId: string
    teamName: string
    initialTasks: Task[]
    projects: Project[]
}

export function KanbanView({ teamId, teamName, initialTasks, projects }: KanbanViewProps) {
    const router = useRouter()
    const [selectedProjectId, setSelectedProjectId] = useState(
        projects[0]?.id ?? 'all'
    )

    const filteredTasks = useMemo(() => {
        if (selectedProjectId === 'all') return initialTasks
        return initialTasks.filter(task => task.projectId === selectedProjectId)
    }, [initialTasks, selectedProjectId])

    const canCreateTask = selectedProjectId !== 'all'

    return (
        <div className="flex h-full flex-col">
            <header className="flex items-center justify-between border-b border-border px-6 py-4">
                <div className="flex flex-col gap-1">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Team</p>
                    <h1 className="text-lg font-semibold text-foreground">{teamName}</h1>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Project</span>
                        <select
                            value={selectedProjectId}
                            onChange={event => setSelectedProjectId(event.target.value)}
                            className="h-8 rounded-none border border-border bg-background px-2 text-xs text-foreground"
                        >
                            <option value="all">All projects</option>
                            {projects.map(project => (
                                <option key={project.id} value={project.id}>
                                    {project.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    {!canCreateTask && (
                        <span className="text-xs text-muted-foreground">
                            Select a project to create tasks
                        </span>
                    )}
                </div>
            </header>
            <div className="flex-1 overflow-hidden px-6 py-5">
                {projects.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                        Create a project to start tracking tasks.
                    </div>
                ) : (
                    <KanbanBoardDnd
                        tasks={filteredTasks}
                        projectId={canCreateTask ? selectedProjectId : undefined}
                        teamId={teamId}
                        onRefresh={() => router.refresh()}
                    />
                )}
            </div>
        </div>
    )
}
