import logger from '@repo/shared/utils/logger'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useWireState } from '@forminator/react-wire'
import * as store from '@/store'
import { Task, TaskLane, TaskStatus } from '@repo/shared/types'
import { v7 as uuidv7 } from 'uuid'
import {
    useCreateTaskLaneMutation,
    useDeleteTaskLaneMutation,
    useUpdateTaskLaneMutation,
} from '@/lib/mutations/lanes.mutations'
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { useQueryClient } from '@tanstack/react-query'
import { type ColumnDropData, type TaskDropData, isColumnDropData, isTaskDragData, isTaskDropData } from './dragTypes'
import { DropIndicatorData } from '@repo/shared/types'
import { useCreateTaskMutation, useUpdateTaskOrderMutation } from '@/lib/mutations/tasks.mutations'
import { generateSlug } from '@repo/shared/utils/slugs'

const log = logger('KanbanBoardDndViewModel')

const KanbanBoardDndViewModel = (
    lanes: TaskLane[],
    tasks: Task[],
    teamId?: string,
    projectId?: string,
    queryKey?: ReadonlyArray<string | number | boolean | undefined | Record<string, unknown>>,
    onRefresh?: () => void,
    onLanesChange?: (lanes: TaskLane[]) => void,
) => {
    
    const [localTasks, setLocalTasks] = useState<Task[]>(tasks)
    const [localLanes, setLocalLanes] = useState<TaskLane[]>(lanes)
    const [isCreating, setIsCreating] = useState<string | null>(null)
    const [isAddingLane, setIsAddingLane] = useState(false)
    const [dropIndicator, setDropIndicator] = useState<DropIndicatorData | null>(null)
    const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null)
    const [editingLaneId, setEditingLaneId] = useState<string | null>(null)
    const [editingLaneName, setEditingLaneName] = useState('')
    const [savingLaneId, setSavingLaneId] = useState<string | null>(null)
    const [deletingLaneId, setDeletingLaneId] = useState<string | null>(null)
    
    const [collapsedLanes, setCollapsedLanes] = useWireState<string[]>(store.collapsedLanes)
    
    const canManageLanes = Boolean(projectId && onLanesChange)
    const canDeleteLane = localLanes.length > 1
    
    const queryClient = useQueryClient()
    
    const activeQueryKey = useMemo(() => queryKey || ['tasks'], [queryKey])
    const lanesQueryKey = useMemo(
        () => ['lanes', projectId || 'unknown'],
        [projectId],
    )
    
    useEffect(() => {
        setLocalTasks(tasks)
    }, [tasks])
    
    useEffect(() => {
        setLocalLanes(lanes)
    }, [lanes])
    
    const createTaskMutation = useCreateTaskMutation(
        localTasks,
        setLocalTasks,
        activeQueryKey,
        teamId,
        projectId,
        onRefresh,
    )
    
    const createTaskLaneMutation = useCreateTaskLaneMutation(
        teamId,
        projectId,
        localLanes,
        setLocalLanes,
        lanesQueryKey,
        onRefresh,
    )
    
    const updateTaskLaneMutation = useUpdateTaskLaneMutation(
        teamId,
        projectId,
        localLanes,
        setLocalLanes,
        lanesQueryKey,
        onRefresh,
    )
    
    const deleteTaskLaneMutation = useDeleteTaskLaneMutation(
        teamId,
        projectId,
        localLanes,
        setLocalLanes,
        lanesQueryKey,
        onRefresh,
    )
    
    const updateTaskOrderMutation = useUpdateTaskOrderMutation(
        localTasks,
        setLocalTasks,
        activeQueryKey,
        teamId,
        projectId,
        onRefresh,
    )
    
    const handleAddLane = async () => {
        if (!projectId || !onLanesChange) return
        setIsAddingLane(true)
        try {
            const tempId = uuidv7()
            await createTaskLaneMutation.mutateAsync({
                key: generateSlug('New Lane'),
                name: 'New Lane',
                color: 'bg-muted',
                tempId,
            })
            const next = queryClient.getQueryData<TaskLane[]>(lanesQueryKey) || localLanes
            onLanesChange(next)
        } catch (error) {
            log.e('Failed to create lane:', error)
        } finally {
            setIsAddingLane(false)
        }
    }
    
    const handleToggleCollapsed = (laneId: string) => {
        
        setCollapsedLanes((prev: string[]) => {
            
            const next = new Set(prev)
            
            if (next.has(laneId))
                next.delete(laneId)
            else
                next.add(laneId)
            
            return Array.from(next)
            
        })
        
    }
    
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
        const task = localTasks.find(t => t.id === taskId)
        if (!task) return
        // Optimistic update
        const tasksInNewStatus = localTasks
            .filter(t => t.status === newStatus && t.id !== taskId)
            .sort((a, b) => a.order - b.order)
        let newOrder: number
        if (!targetTaskId) {
            // Drop at end
            const maxOrder = tasksInNewStatus.length > 0
                ? Math.max(...tasksInNewStatus.map(t => t.order))
                : 0
            newOrder = maxOrder + 1000
        } else {
            // Drop before target
            const targetIndex = tasksInNewStatus.findIndex(t => t.id === targetTaskId)
            const prevTask = targetIndex > 0 ? tasksInNewStatus[targetIndex - 1] : null
            const nextTask = tasksInNewStatus[targetIndex]
            if (prevTask && nextTask) {
                // Calculate midpoint
                newOrder = (prevTask.order + nextTask.order) / 2
            } else if (nextTask) {
                // First position
                newOrder = nextTask.order - 1000
            } else {
                // Only one item
                newOrder = 1000
            }
        }
        updateTaskOrderMutation.mutate({ taskId, status: newStatus, order: newOrder })
    }, [localTasks, onRefresh, tasks, updateTaskOrderMutation])
    
    useEffect(() => {
        const monitor = monitorForElements as unknown as (args: {
            onDragStart?: (args: { source: { data: Record<string, unknown> } }) => void
            onDrag?: (args: {
                location: { current: { dropTargets: Array<{ data: unknown }> } }
            }) => void
            onDrop?: (args: {
                source: { data: Record<string, unknown> }
                location: { current: { dropTargets: Array<{ data: unknown }> } }
            }) => void
            onDragEnd?: () => void
        }) => () => void
        return monitor({
            onDragStart: (args: { source: { data: Record<string, unknown> } }) => {
                if (isTaskDragData(args.source.data))
                    setDraggingTaskId(args.source.data.taskId)
            },
            onDrag: (args: {
                location: { current: { dropTargets: Array<{ data: unknown }> } }
            }) => {
                const dropTargets = args.location.current.dropTargets
                if (!dropTargets.length) {
                    setDropIndicator(null)
                    return
                }
                const taskTarget = dropTargets.find((target: { data: unknown }) =>
                    isTaskDropData(target.data as Record<string, unknown>),
                )
                if (taskTarget?.data && isTaskDropData(taskTarget.data as Record<string, unknown>)) {
                    const taskTargetData = taskTarget.data as TaskDropData
                    setDropIndicator({
                        status: taskTargetData.status,
                        taskId: taskTargetData.taskId,
                    })
                    return
                }
                const columnTarget = dropTargets.find((target: { data: unknown }) =>
                    isColumnDropData(target.data as Record<string, unknown>),
                )
                if (columnTarget?.data && isColumnDropData(columnTarget.data as Record<string, unknown>)) {
                    const columnTargetData = columnTarget.data as ColumnDropData
                    setDropIndicator({ status: columnTargetData.status })
                    return
                }
                setDropIndicator(null)
            },
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
                    void handleDrop(
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
                    void handleDrop(
                        source.data.taskId,
                        columnData.status,
                    )
                }
                setDropIndicator(null)
                setDraggingTaskId(null)
            },
            onDragEnd: () => {
                setDropIndicator(null)
                setDraggingTaskId(null)
            },
        })
    }, [handleDrop])
    
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
        setSavingLaneId(laneId)
        try {
            await updateTaskLaneMutation.mutateAsync({
                laneId,
                data: { name: nextName },
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
    
    return {
        
        // State
        localTasks,
        setLocalTasks,
        isCreating,
        setIsCreating,
        isAddingLane,
        setIsAddingLane,
        dropIndicator,
        setDropIndicator,
        draggingTaskId,
        setDraggingTaskId,
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
        handleCreateTask,
        handleDrop,
        
    }
    
}

export default KanbanBoardDndViewModel
