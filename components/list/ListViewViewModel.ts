'use client'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Project, Task, TaskLane } from '@/types'
import useDebounce from '@/hooks/useDebounce'
import useTasksQuery from '@/lib/queries/useTasksQuery'

const ListViewViewModel = (
    teamId: string,
    project: Project,
    initialLanes: TaskLane[],
    initialTasks: Task[],
) => {
    
    const router = useRouter()
    const projectId = project.id
    
    const [lanes, setLanes] = useState<TaskLane[]>(initialLanes)
    const [query, setQuery] = useState<string>('')
    const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set())
    
    const queryDebounced = useDebounce(query, 1200)
    
    const { data: tasks = initialTasks } = useTasksQuery(teamId, projectId, initialTasks)
    
    const filteredTasks = useMemo(() => {
        
        if (!query.length)
            return tasks
        
        return tasks.filter(it => it.title
            .toLowerCase()
            .includes(queryDebounced.toLowerCase()))
        
    }, [tasks, queryDebounced])
    
    useEffect(() => {
        setLanes(initialLanes)
    }, [initialLanes])
    
    // Group tasks by status, maintaining lane order
    const groupedTasks = useMemo(() => {
        return lanes.map(lane => ({
            lane,
            tasks: filteredTasks.filter(t => t.status === lane.key),
        }))
    }, [lanes, filteredTasks])
    
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
        query,
        setQuery,
        selectedTasks,
        setSelectedTasks,
        
        // Memos
        hasSelection,
        
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
