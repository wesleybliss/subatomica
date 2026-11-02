import { Task, TaskLane, TaskStatus } from '@repo/shared/types'
import Logger from '@repo/shared/utils/logger'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { v7 as uuidv7 } from 'uuid'

import usePragmaticDnDMonitor from '@/hooks/usePragmaticDnDMonitor'
import useTaskLanes from '@/hooks/useTaskLanes'
import { useCreateTaskMutation, useUpdateTaskOrderMutation } from '@/lib/mutations/tasks.mutations'

const log = new Logger('web/components/kanban/KanbanBoardDndViewModel')

const KanbanBoardDndViewModel = (
    lanes: TaskLane[],
    tasks: Task[],
    teamId?: string,
    projectId?: string,
    queryKey?: ReadonlyArray<string | number | boolean | undefined | Record<string, unknown>>,
    onRefresh?: () => void,
    onLanesChange?: (lanes: TaskLane[]) => void,
    enablePragmaticMonitor = true,
) => {
    
    // Temporary drag projection only — never a second server-state copy.
    // While non-null, board rendering uses this overlay; query cache stays untouched until drop.
    const [dragProjection, setDragProjection] = useState<Task[] | null>(null)
    const [localLanes, setLocalLanes] = useState<TaskLane[]>(lanes)
    const [isCreating, setIsCreating] = useState<string | null>(null)
    
    const queryClient = useQueryClient()
    
    const activeQueryKey = useMemo(() => queryKey || ['tasks'], [queryKey])
    
    const displayTasks = dragProjection ?? tasks
    
    useEffect(() => {
        setLocalLanes(lanes)
    }, [lanes])
    
    const createTaskMutation = useCreateTaskMutation(
        activeQueryKey,
        teamId,
        projectId,
        onRefresh,
    )
    
    const updateTaskOrderMutation = useUpdateTaskOrderMutation(
        activeQueryKey,
        teamId,
        projectId,
        onRefresh,
    )
    
    const tasksByStatus = useMemo<Record<string, Task[]>>(() => {
        const sorted = [...displayTasks].sort((a, b) => a.order - b.order)
        return sorted.reduce((acc, task) => {
            // Sanity check warning if there are tasks that don't have a corresponding lane
            // This should never happen, but it's an edge case if a lane is renamed, but
            // it's key or the tasks' keys don't get properly updated too
            // @todo put these tasks in an "Unorganized" lane so the user can at least organize them
            if (!localLanes.some(it => it.key === task.status))
                log.w('Lane not found for task status:', task.status,
                    'in lanes', localLanes.map(it => it.key))
            
            if (!acc[task.status])
                acc[task.status] = []
            
            acc[task.status].push(task)
            return acc
        }, {} as Record<string, Task[]>)
    }, [localLanes, displayTasks])
    
    const {
        collapsedLanes,
        isAddingLane,
        setIsAddingLane,
        editingLaneId,
        setEditingLaneId,
        editingLaneName,
        setEditingLaneName,
        savingLaneId,
        setSavingLaneId,
        deletingLaneId,
        setDeletingLaneId,
        canManageLanes,
        canDeleteLane,
        handleAddLane,
        handleToggleCollapsed,
        handleStartRenameLane,
        handleCancelRenameLane,
        handleRenameLane,
        handleDeleteLane,
        handleLaneColorChange,
        handleReorderLane,
    } = useTaskLanes(
        teamId,
        projectId,
        localLanes,
        setLocalLanes,
        onRefresh,
        onLanesChange,
        activeQueryKey,
    )
    
    const handleCreateTask = async (status: TaskStatus) => {
        if (!projectId) return
        setIsCreating(status)
        try {
            const tempId = uuidv7()
            await createTaskMutation.mutateAsync({ status, tempId })
        } catch (error) {
            log.e('Failed to create task:', error)
        } finally {
            setIsCreating(null)
        }
    }
    
    const handleDrop = useCallback(async (
        taskId: string,
        newStatus: TaskStatus,
        targetTaskId?: string,
    ) => {
        log.d('Drag drop:', { taskId, newStatus, targetTaskId })
        const currentTasks = queryClient.getQueryData<Task[]>(activeQueryKey) ?? tasks
        const task = currentTasks.find(t => t.id === taskId)
        if (!task) return
        const tasksInNewStatus = currentTasks
            .filter(t => t.status === newStatus && t.id !== taskId)
            .sort((a, b) => a.order - b.order)
        let newOrder: number
        if (!targetTaskId) {
            const maxOrder = tasksInNewStatus.length > 0
                ? Math.max(...tasksInNewStatus.map(t => t.order))
                : 0
            newOrder = maxOrder + 1000
        } else {
            const targetIndex = tasksInNewStatus.findIndex(t => t.id === targetTaskId)
            const prevTask = targetIndex > 0 ? tasksInNewStatus[targetIndex - 1] : null
            const nextTask = tasksInNewStatus[targetIndex]
            if (prevTask && nextTask) {
                newOrder = (prevTask.order + nextTask.order) / 2
            } else if (nextTask) {
                newOrder = nextTask.order - 1000
            } else {
                newOrder = 1000
            }
        }
        updateTaskOrderMutation.mutate({ taskId, status: newStatus, order: newOrder })
    }, [activeQueryKey, queryClient, tasks, updateTaskOrderMutation])
    
    // Keep monitor registration stable — do not re-bind when handleDrop identity changes
    const handleDropRef = useRef(handleDrop)
    handleDropRef.current = handleDrop
    
    usePragmaticDnDMonitor(enablePragmaticMonitor, handleDropRef)
    
    return {
        
        // State
        displayTasks,
        dragProjection,
        setDragProjection,
        localLanes,
        setLocalLanes,
        isCreating,
        setIsCreating,
        isAddingLane,
        setIsAddingLane,
        editingLaneId,
        setEditingLaneId,
        editingLaneName,
        setEditingLaneName,
        savingLaneId,
        setSavingLaneId,
        deletingLaneId,
        setDeletingLaneId,
        
        collapsedLanes,
        
        // @todo
        canManageLanes,
        canDeleteLane,
        queryClient,
        
        // Memos
        activeQueryKey,
        tasksByStatus,
        
        // Mutations
        createTaskMutation,
        updateTaskOrderMutation,
        
        // Methods
        handleAddLane,
        handleToggleCollapsed,
        handleStartRenameLane,
        handleCancelRenameLane,
        handleRenameLane,
        handleDeleteLane,
        handleReorderLane,
        handleLaneColorChange,
        handleCreateTask,
        handleDrop,
        
    }
    
}

export default KanbanBoardDndViewModel
