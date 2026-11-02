import { ID, TaskLane } from '@repo/shared/types'
import { Logger } from '@repo/shared/utils/logger'
import { generateSlug } from '@repo/shared/utils/slugs'
import { useQueryClient } from '@tanstack/react-query'
import { Dispatch, SetStateAction, useMemo, useState } from 'react'
import { v7 as uuidv7 } from 'uuid'

import {
    useCreateTaskLaneMutation,
    useDeleteTaskLaneMutation,
    useUpdateTaskLaneMutation,
} from '@/lib/mutations/lanes.mutations'
import { useLaneStore } from '@/store'

const log = new Logger('web/hooks/useTaskLanes')

const useTaskLanes = (
    teamId: ID | undefined,
    projectId: ID | undefined,
    localLanes: TaskLane[],
    setLocalLanes: Dispatch<SetStateAction<TaskLane[]>>,
    onRefresh?: () => void,
    onLanesChange?: (lanes: TaskLane[]) => void,
) => {
    
    const collapsedLanes = useLaneStore(s => s.collapsedLanes)
    const setCollapsedLanes = useLaneStore(s => s.setCollapsedLanes)
    
    const [isAddingLane, setIsAddingLane] = useState(false)
    const [editingLaneId, setEditingLaneId] = useState<string | null>(null)
    const [editingLaneName, setEditingLaneName] = useState('')
    const [savingLaneId, setSavingLaneId] = useState<string | null>(null)
    const [deletingLaneId, setDeletingLaneId] = useState<string | null>(null)
    
    const queryClient = useQueryClient()
    
    const lanesQueryKey = useMemo(
        () => ['lanes', projectId || 'unknown'],
        [projectId],
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
        
        createTaskLaneMutation,
        updateTaskLaneMutation,
        deleteTaskLaneMutation,
        
        handleAddLane,
        handleToggleCollapsed,
    }
    
}

export default useTaskLanes
