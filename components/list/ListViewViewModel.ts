'use client'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import type { Project, Task, TaskLane } from '@/types'

const ListViewViewModel = (
    teamId: string,
    project: Project,
    initialLanes: TaskLane[],
    initialTasks: Task[],
) => {
    
    const router = useRouter()
    const projectId = project.id
    
    const tasksQueryKey = useMemo(() => (
        ['tasks', { teamId, projectId }] as const
    ), [teamId, projectId])
    
    const { data: tasks = initialTasks } = useQuery({
        queryKey: tasksQueryKey,
        queryFn: async () => {
            const params = new URLSearchParams({ teamId, projectId })
            const response = await fetch(`/api/tasks?${params.toString()}`)
            if (!response.ok)
                throw new Error('Failed to fetch tasks')
            return await response.json() as Promise<Task[]>
        },
        initialData: initialTasks,
    })
    
    const [lanes, setLanes] = useState<TaskLane[]>(initialLanes)
    const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set())
    
    useEffect(() => {
        setLanes(initialLanes)
    }, [initialLanes])
    
    // Group tasks by status, maintaining lane order
    const groupedTasks = useMemo(() => {
        return lanes.map(lane => ({
            lane,
            tasks: tasks.filter(t => t.status === lane.key),
        }))
    }, [lanes, tasks])
    
    const handleToggleTask = (taskId: string) => {
        const newSelected = new Set(selectedTasks)
        if (newSelected.has(taskId)) {
            newSelected.delete(taskId)
        } else {
            newSelected.add(taskId)
        }
        setSelectedTasks(newSelected)
    }
    
    const handleSelectAll = (taskIds: string[]) => {
        const newSelected = new Set(selectedTasks)
        taskIds.forEach(id => newSelected.add(id))
        setSelectedTasks(newSelected)
    }
    
    const handleDeleteTask = async (taskId: string) => {
        try {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'DELETE',
            })
            if (!response.ok) throw new Error('Failed to delete task')
            router.refresh()
            setSelectedTasks(prev => {
                const newSet = new Set(prev)
                newSet.delete(taskId)
                return newSet
            })
        } catch (error) {
            console.error('Failed to delete task:', error)
        }
    }
    
    const handleDeleteSelected = async () => {
        if (!confirm(`Delete ${selectedTasks.size} task(s)?`)) return
        try {
            await Promise.all(
                Array.from(selectedTasks).map(taskId =>
                    fetch(`/api/tasks/${taskId}`, { method: 'DELETE' }),
                ),
            )
            router.refresh()
            setSelectedTasks(new Set())
        } catch (error) {
            console.error('Failed to delete tasks:', error)
        }
    }
    
    const handleChangeStatus = async (newStatus: string) => {
        try {
            await Promise.all(
                Array.from(selectedTasks).map(taskId =>
                    fetch(`/api/tasks/${taskId}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: newStatus }),
                    }),
                ),
            )
            router.refresh()
            setSelectedTasks(new Set())
        } catch (error) {
            console.error('Failed to update tasks:', error)
        }
    }
    
    const handleTasksReorder = async (taskIds: string[], newStatus: string) => {
        try {
            await Promise.all(
                taskIds.map(taskId =>
                    fetch(`/api/tasks/${taskId}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: newStatus }),
                    }),
                ),
            )
            router.refresh()
        } catch (error) {
            console.error('Failed to reorder tasks:', error)
        }
    }
    
    const hasSelection = useMemo(() => selectedTasks.size > 0, [selectedTasks])
    
    return {
        
        // State
        router,
        projectId,
        lanes,
        setLanes,
        selectedTasks,
        setSelectedTasks,
        
        // Memos
        hasSelection,
        
        // Queries
        tasksQueryKey,
        
        // Methods
        groupedTasks,
        handleToggleTask,
        handleSelectAll,
        handleDeleteTask,
        handleDeleteSelected,
        handleChangeStatus,
        handleTasksReorder,
        
    }
    
}

export default ListViewViewModel
