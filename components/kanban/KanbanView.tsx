'use client'
import { useActionState, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Project, Task, TaskLane, TeamMemberProfile } from '@/types'
import type { CreateProjectResult } from '@/types/kanban.types'
import { KanbanBoardDnd } from './KanbanBoardDnd'
import { ChevronDown, FolderPlus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { useQuery } from '@tanstack/react-query'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuPortal,
    DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface KanbanViewProps {
    teamId: string
    initialTasks: Task[]
    projects: Project[]
    initialLanes: TaskLane[]
    teamMembers: TeamMemberProfile[]
    onCreateProject?: (
        prevState: CreateProjectResult,
        formData: FormData,
    ) => Promise<CreateProjectResult>
}

export function KanbanView({
    teamId,
    initialTasks,
    projects,
    initialLanes,
    teamMembers,
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
    const tasksQueryKey = useMemo(() => (
        ['tasks', { teamId, projectId: selectedProjectId }] as const
    ), [teamId, selectedProjectId])
    const { data: tasks = filteredTasks } = useQuery({
        queryKey: tasksQueryKey,
        queryFn: async () => {
            const params = new URLSearchParams({ teamId })
            if (selectedProjectId !== 'all')
                params.set('projectId', selectedProjectId)
            const response = await fetch(`/api/tasks?${params.toString()}`)
            if (!response.ok)
                throw new Error('Failed to fetch tasks')
            return response.json() as Promise<Task[]>
        },
        initialData: filteredTasks,
    })
    
    
    const [lanes, setLanes] = useState<TaskLane[]>(initialLanes)
    useEffect(() => {
        setLanes(initialLanes)
    }, [initialLanes])
    return (
        <div className="flex h-full flex-col">
            <header className="flex items-center justify-between border-b border-border px-6 py-4">
                <div className="flex items-center gap-3">
                    <SidebarTrigger className="-ml-1" />
                    <div className="flex flex-col gap-1">
                        <DropdownMenu>
                            <DropdownMenuTrigger render={(
                                <Button
                                    className="flex justify-between items-center gap-2 opacity-70 hover:opacity-100"
                                    variant="ghost">
                                    <span className="text-sm">
                                        {projects?.find(it => it.id === selectedProjectId)?.name}
                                    </span>
                                    <ChevronDown size="16px" />
                                </Button>
                            )} />
                            <DropdownMenuContent className="w-40" align="start">
                                <DropdownMenuGroup>
                                    <DropdownMenuLabel>Starred</DropdownMenuLabel>
                                    <DropdownMenuItem disabled>No starred projects.</DropdownMenuItem>
                                </DropdownMenuGroup>
                                <DropdownMenuGroup>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuLabel>Projects</DropdownMenuLabel>
                                    {projects?.map(it => it.id !== selectedProjectId ? (
                                        <DropdownMenuItem
                                            key={`projects-menu-${it.id}`}
                                            className="flex justify-between items-center gap-2"
                                            onClick={() => router.push(`/t/${teamId}/p/${it.id}`)}>
                                            <span>{it.name}</span>
                                            {it.id === selectedProjectId && (
                                                <span className="block size-2 rounded-full bg-green-700/40" />
                                            )}
                                        </DropdownMenuItem>
                                    ) : (
                                        <DropdownMenuSub key={`projects-menu-${it.id}`}>
                                            <DropdownMenuSubTrigger>
                                                <div className="w-full flex-1 flex justify-between items-center gap-2">
                                                    <span>{it.name}</span>
                                                    {it.id === selectedProjectId && (
                                                        <span className="block size-2 rounded-full bg-green-700/40" />
                                                    )}
                                                </div>
                                            </DropdownMenuSubTrigger>
                                            <DropdownMenuPortal>
                                                <DropdownMenuSubContent>
                                                    <DropdownMenuGroup>
                                                        <DropdownMenuItem
                                                            onClick={() => console.log('@todo rename project', it)}>
                                                            <Pencil className="text-muted-foreground" />
                                                            <span>Rename</span>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuGroup>
                                                    <DropdownMenuGroup>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => console.log('@todo delete project')}>
                                                            <Trash2 className="text-destructive-foreground" />
                                                            <span>Delete</span>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuGroup>
                                                </DropdownMenuSubContent>
                                            </DropdownMenuPortal>
                                        </DropdownMenuSub>
                                    ))}
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
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
                        tasks={tasks}
                        lanes={lanes}
                        projectId={canCreateTask ? selectedProjectId : undefined}
                        teamId={teamId}
                        teamMembers={teamMembers}
                        queryKey={tasksQueryKey}
                        onLanesChange={setLanes}
                        onRefresh={() => router.refresh()}/>
                )}
            </div>
        </div>
    )
}
