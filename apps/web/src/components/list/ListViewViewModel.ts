import { useEffect, useMemo, useState } from 'react'
import type { Project, Task, TaskLane } from '@repo/shared/types'

const ListViewViewModel = (
    teamId: string,
    project: Project,
    tasks: Task[],
    initialLanes: TaskLane[],
    parentSelectedTasks?: Set<string>,
    setParentSelectedTasks?: (tasks: Set<string>) => void,
) => {
    
    const projectId = project.id
    
    const [lanes, setLanes] = useState<TaskLane[]>(initialLanes)
    const [selectedTasks, setSelectedTasks] = useState<Set<string>>(parentSelectedTasks ?? new Set())
    
    useEffect(() => {
        setParentSelectedTasks?.(selectedTasks)
    }, [selectedTasks, setParentSelectedTasks])
    
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
        setSelectedTasks(prev => {
            const newSelected = new Set(prev)
            if (newSelected.has(taskId)) {
                newSelected.delete(taskId)
            } else {
                newSelected.add(taskId)
            }
            return newSelected
        })
    }
    
    const handleSelectAll = (taskIds: string[]) => {
        setSelectedTasks(prev => {
            const newSelected = new Set(prev)
            taskIds.forEach(id => newSelected.add(id))
            return newSelected
        })
    }
    
    const handleDeselectAll = (taskIds: string[]) => {
        setSelectedTasks(prev => {
            const newSelected = new Set(prev)
            taskIds.forEach(id => newSelected.delete(id))
            return newSelected
        })
    }
    
    const handleDeleteTask = async (taskId: string) => {
        try {
            const response = await fetch(`/teams/${teamId}/projects/${projectId}/tasks/${taskId}`, {
                method: 'DELETE',
            })
            if (!response.ok) throw new Error('Failed to delete task')
            window.location.reload()
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
                    fetch(`/teams/${teamId}/projects/${projectId}/tasks/${taskId}`, { method: 'DELETE' }),
                ),
            )
            window.location.reload()
            setSelectedTasks(new Set())
        } catch (error) {
            console.error('Failed to delete tasks:', error)
        }
    }
    
    const handleChangeStatus = async (newStatus: string) => {
        try {
            await Promise.all(
                Array.from(selectedTasks).map(taskId =>
                    fetch(`/teams/${teamId}/projects/${projectId}/tasks/${taskId}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: newStatus }),
                    }),
                ),
            )
            window.location.reload()
            setSelectedTasks(new Set())
        } catch (error) {
            console.error('Failed to update tasks:', error)
        }
    }
    
    const handleTasksReorder = async (taskIds: string[], newStatus: string) => {
        try {
            await Promise.all(
                taskIds.map(taskId =>
                    fetch(`/teams/${teamId}/projects/${projectId}/tasks/${taskId}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: newStatus }),
                    }),
                ),
            )
            window.location.reload()
        } catch (error) {
            console.error('Failed to reorder tasks:', error)
        }
    }
    
    const hasSelection = useMemo(() => selectedTasks.size > 0, [selectedTasks])
    
    return {
        
        // State
        projectId,
        lanes,
        setLanes,
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
        handleDeselectAll,
        
    }
    
}

export default ListViewViewModel
