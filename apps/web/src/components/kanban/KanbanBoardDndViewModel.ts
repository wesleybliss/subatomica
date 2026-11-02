import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { Task, TaskLane, TaskStatus } from '@repo/shared/types'
import Logger from '@repo/shared/utils/logger'
import { generateSlug } from '@repo/shared/utils/slugs'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { v7 as uuidv7 } from 'uuid'

import useTaskLanes from '@/hooks/useTaskLanes'
import { normalizeLaneHexForStorage } from '@/lib/constants/lane-colors.constants'
import { useCreateTaskMutation, useUpdateTaskOrderMutation } from '@/lib/mutations/tasks.mutations'

import { type ColumnDropData, isColumnDropData, isTaskDragData, isTaskDropData, type TaskDropData } from './dragTypes'

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
    
    const canManageLanes = Boolean(projectId && onLanesChange)
    const canDeleteLane = localLanes.length > 1
    
    const queryClient = useQueryClient()
    
    const activeQueryKey = useMemo(() => queryKey || ['tasks'], [queryKey])
    const lanesQueryKey = useMemo(
        () => ['lanes', projectId || 'unknown'],
        [projectId],
    )
    
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
        updateTaskLaneMutation,
        deleteTaskLaneMutation,
        handleAddLane,
        handleToggleCollapsed,
    } = useTaskLanes(
        teamId,
        projectId,
        localLanes,
        setLocalLanes,
        onRefresh,
        onLanesChange,
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
    
    useEffect(() => {
        if (!enablePragmaticMonitor) return
        
        const monitor = monitorForElements as unknown as (args: {
            onDrop?: (args: {
                source: { data: Record<string, unknown> }
                location: { current: { dropTargets: Array<{ data: unknown }> } }
            }) => void
        }) => () => void
        return monitor({
            // Visual drop indicators live on each card/column (enter/leave) — never
            // set React state from onDrag pointer samples at the board level.
            onDrop: (args: {
                source: { data: Record<string, unknown> }
                location: { current: { dropTargets: Array<{ data: unknown }> } }
            }) => {
                const { source, location } = args
                if (!isTaskDragData(source.data)) return
                const dropTargets = location.current.dropTargets
                if (!dropTargets.length) return
                const taskTarget = dropTargets.find((target: { data: unknown }) =>
                    isTaskDropData(target.data as Record<string, unknown>),
                )
                const taskTargetData = taskTarget?.data
                if (taskTargetData && isTaskDropData(taskTargetData as Record<string, unknown>)) {
                    const taskData = taskTargetData as TaskDropData
                    void handleDropRef.current(
                        source.data.taskId,
                        taskData.status,
                        taskData.taskId,
                    )
                    return
                }
                const columnTarget = dropTargets.find((target: { data: unknown }) =>
                    isColumnDropData(target.data as Record<string, unknown>),
                )
                const columnTargetData = columnTarget?.data
                if (columnTargetData && isColumnDropData(columnTargetData as Record<string, unknown>)) {
                    const columnData = columnTargetData as ColumnDropData
                    void handleDropRef.current(
                        source.data.taskId,
                        columnData.status,
                    )
                }
            },
        })
    }, [enablePragmaticMonitor])
    
    const handleStartRenameLane = (lane: TaskLane) => {
        setEditingLaneId(lane.id)
        setEditingLaneName(lane.name)
    }
    
    const handleCancelRenameLane = () => {
        setEditingLaneId(null)
        setEditingLaneName('')
    }
    
    const handleRenameLane = async (laneId: string) => {
        if (!onLanesChange) return
        const nextName = editingLaneName.trim()
        if (!nextName) {
            handleCancelRenameLane()
            return
        }
        
        const lane = localLanes.find(l => l.id === laneId)
        if (!lane) return
        
        const oldKey = lane.key
        const nextKey = generateSlug(nextName)
        
        setSavingLaneId(laneId)
        try {
            // Optimistically update task statuses in the query cache if key changed
            if (oldKey !== nextKey) {
                queryClient.setQueryData<Task[]>(activeQueryKey, current =>
                    (current || []).map(task =>
                        task.status === oldKey ? { ...task, status: nextKey } : task,
                    ),
                )
            }
            
            await updateTaskLaneMutation.mutateAsync({
                laneId,
                data: { name: nextName, key: nextKey },
            })
            const next = queryClient.getQueryData<TaskLane[]>(lanesQueryKey) || localLanes
            onLanesChange(next)
        } catch (error) {
            log.e('Failed to update lane:', error)
        } finally {
            setSavingLaneId(null)
            handleCancelRenameLane()
        }
    }
    
    const handleDeleteLane = async (laneId: string) => {
        if (!onLanesChange || !canDeleteLane) return log.d('Cannot delete lane:', laneId)
        setDeletingLaneId(laneId)
        try {
            log.d('Deleting lane:', laneId)
            await deleteTaskLaneMutation.mutateAsync({ laneId })
            const next = queryClient.getQueryData<TaskLane[]>(lanesQueryKey) || localLanes
            onLanesChange(next)
        } catch (error) {
            log.e('Failed to delete lane:', error)
        } finally {
            setDeletingLaneId(null)
        }
    }
    const getLaneOrderForMove = (
        sortedLanes: TaskLane[],
        sourceIndex: number,
        targetIndex: number,
    ) => {
        const movingRight = targetIndex > sourceIndex
        const insertIndex = movingRight ? targetIndex + 1 : targetIndex
        const prevLane = sortedLanes[insertIndex - 1]
        const nextLane = sortedLanes[insertIndex]
        if (prevLane && nextLane)
            return Math.round((prevLane.order + nextLane.order) / 2)
        if (prevLane)
            return prevLane.order + 1000
        if (nextLane)
            return nextLane.order - 1000
        return 1000
    }
    const handleLaneColorChange = (laneId: string, hex: string) => {
        if (!canManageLanes) return
        updateTaskLaneMutation.mutate({
            laneId,
            data: { color: normalizeLaneHexForStorage(hex) },
        })
    }
    
    const handleReorderLane = async (sourceLaneId: string, targetLaneId: string) => {
        if (!canManageLanes || sourceLaneId === targetLaneId) return
        const sortedLanes = [...localLanes].sort((a, b) => a.order - b.order)
        const sourceIndex = sortedLanes.findIndex(lane => lane.id === sourceLaneId)
        const targetIndex = sortedLanes.findIndex(lane => lane.id === targetLaneId)
        if (sourceIndex < 0 || targetIndex < 0) return
        const previousLanes = localLanes
        const nextOrder = getLaneOrderForMove(sortedLanes, sourceIndex, targetIndex)
        const nextLanes = sortedLanes
            .map(lane => lane.id === sourceLaneId ? { ...lane, order: nextOrder } : lane)
            .sort((a, b) => a.order - b.order)
        setLocalLanes(nextLanes)
        onLanesChange?.(nextLanes)
        try {
            await updateTaskLaneMutation.mutateAsync({
                laneId: sourceLaneId,
                data: { order: nextOrder },
            })
            const next = queryClient.getQueryData<TaskLane[]>(lanesQueryKey) || nextLanes
            onLanesChange?.([...next].sort((a, b) => a.order - b.order))
        } catch (error) {
            log.e('Failed to reorder lane:', error)
            setLocalLanes(previousLanes)
            onLanesChange?.(previousLanes)
        }
    }
    
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
