import { ID, Task, TaskLane } from '@repo/shared/types'
import { Logger } from '@repo/shared/utils/logger'
import { generateSlug } from '@repo/shared/utils/slugs'
import { useQueryClient } from '@tanstack/react-query'
import { Dispatch, SetStateAction, useMemo, useState } from 'react'
import { v7 as uuidv7 } from 'uuid'

import { normalizeLaneHexForStorage } from '@/lib/constants/lane-colors.constants'
import {
    useCreateTaskLaneMutation,
    useDeleteTaskLaneMutation,
    useUpdateTaskLaneMutation,
} from '@/lib/mutations/lanes.mutations'
import { useLaneStore } from '@/store'

const log = new Logger('web/hooks/useTaskLanes')

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

const useTaskLanes = (
    teamId: ID | undefined,
    projectId: ID | undefined,
    localLanes: TaskLane[],
    setLocalLanes: Dispatch<SetStateAction<TaskLane[]>>,
    onRefresh?: () => void,
    onLanesChange?: (lanes: TaskLane[]) => void,
    tasksQueryKey?: ReadonlyArray<string | number | boolean | undefined | Record<string, unknown>>,
) => {
    
    const collapsedLanes = useLaneStore(s => s.collapsedLanes)
    const setCollapsedLanes = useLaneStore(s => s.setCollapsedLanes)
    
    const [isAddingLane, setIsAddingLane] = useState(false)
    const [editingLaneId, setEditingLaneId] = useState<string | null>(null)
    const [editingLaneName, setEditingLaneName] = useState('')
    const [savingLaneId, setSavingLaneId] = useState<string | null>(null)
    const [deletingLaneId, setDeletingLaneId] = useState<string | null>(null)
    
    const canManageLanes = Boolean(projectId && onLanesChange)
    const canDeleteLane = localLanes.length > 1
    
    const queryClient = useQueryClient()
    
    const lanesQueryKey = useMemo(
        () => ['lanes', projectId || 'unknown'],
        [projectId],
    )
    
    const activeTasksQueryKey = useMemo(
        () => tasksQueryKey || ['tasks'],
        [tasksQueryKey],
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
                queryClient.setQueryData<Task[]>(activeTasksQueryKey, current =>
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
        collapsedLanes,
        setCollapsedLanes,
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
        
        createTaskLaneMutation,
        updateTaskLaneMutation,
        deleteTaskLaneMutation,
        
        handleAddLane,
        handleToggleCollapsed,
        handleStartRenameLane,
        handleCancelRenameLane,
        handleRenameLane,
        handleDeleteLane,
        handleLaneColorChange,
        handleReorderLane,
    }
    
}

export default useTaskLanes
