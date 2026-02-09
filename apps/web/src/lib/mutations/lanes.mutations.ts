import { CreateLaneInput, TaskLane } from '@repo/shared/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { request } from '@/lib/api/client'

export const useCreateTaskLaneMutation = (
    teamId: string | null | undefined,
    projectId: string | null | undefined,
    localLanes: TaskLane[],
    setLocalLanes: (value: TaskLane[]) => void,
    activeQueryKey: readonly (string | number | boolean | Record<string, unknown>)[],
    onRefresh?: () => void,
) => {
    const queryClient = useQueryClient()
    
    return useMutation<
        { created: TaskLane; tempId: string },
        Error,
        CreateLaneInput,
        { previousLanes?: TaskLane[] }
    >({
        mutationFn: async ({ key, name, color, order, tempId }: CreateLaneInput) => {
            if (!teamId)
                throw new Error('Missing team id')
            if (!projectId)
                throw new Error('Missing project id')
            const response = await request<TaskLane>(`/lanes?teamId=${teamId}&projectId=${projectId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, name, color, order, tempId }),
            })
            
            return { created: response, tempId }
        },
        onMutate: async ({ name, color, tempId }) => {
            if (!projectId)
                return { previousLanes: undefined }
            
            await queryClient.cancelQueries({ queryKey: activeQueryKey })
            
            const previousLanes = queryClient.getQueryData<TaskLane[]>(activeQueryKey)
            const nextOrder = Math.max(0, ...localLanes.map(lane => lane.order)) + 1000
            const optimisticLane: TaskLane = {
                id: tempId,
                projectId,
                key: `temp-${tempId}`,
                name: name?.trim() || 'New Lane',
                color: color ?? null,
                order: nextOrder,
                isDefault: false,
            }
            const nextLanes = [...(previousLanes || localLanes), optimisticLane]
                .sort((a, b) => a.order - b.order)
            queryClient.setQueryData(activeQueryKey, nextLanes)
            setLocalLanes(nextLanes)
            
            return { previousLanes }
        },
        onError: (_error: Error, _vars, context: { previousLanes?: TaskLane[] } | undefined) => {
            if (context?.previousLanes)
                queryClient.setQueryData(activeQueryKey, context.previousLanes)
        },
        onSuccess: ({ created, tempId }: { created: TaskLane; tempId: string }) => {
            queryClient.setQueryData(activeQueryKey, (current?: TaskLane[]) =>
                (current || []).map((lane: TaskLane) => (lane.id === tempId ? created : lane)),
            )
        },
        onSettled: () => {
            onRefresh?.()
        },
    })
}

export const useDeleteTaskLaneMutation = (
    teamId: string | null | undefined,
    projectId: string | null | undefined,
    localLanes: TaskLane[],
    setLocalLanes: (value: TaskLane[]) => void,
    activeQueryKey: readonly (string | number | boolean | Record<string, unknown>)[],
    onRefresh?: () => void,
) => {
    const queryClient = useQueryClient()
    
    return useMutation<
        { deletedId: string },
        Error,
        { laneId: string },
        { previousLanes?: TaskLane[] }
    >({
        mutationFn: async ({ laneId }) => {
            await request(`/lanes/${laneId}?teamId=${teamId}&projectId=${projectId}`, {
                method: 'DELETE',
            })
            return { deletedId: laneId }
        },
        onMutate: async ({ laneId }) => {
            await queryClient.cancelQueries({ queryKey: activeQueryKey })
            
            const previousLanes = queryClient.getQueryData<TaskLane[]>(activeQueryKey)
            const nextLanes = (previousLanes || localLanes).filter(lane => lane.id !== laneId)
            queryClient.setQueryData(activeQueryKey, nextLanes)
            setLocalLanes(nextLanes)
            
            return { previousLanes }
        },
        onError: (_error: Error, _vars, context: { previousLanes?: TaskLane[] } | undefined) => {
            if (context?.previousLanes)
                queryClient.setQueryData(activeQueryKey, context.previousLanes)
        },
        onSettled: () => {
            onRefresh?.()
        },
    })
}

export const useUpdateTaskLaneMutation = (
    teamId: string | null | undefined,
    projectId: string | null | undefined,
    localLanes: TaskLane[],
    setLocalLanes: (value: TaskLane[]) => void,
    activeQueryKey: readonly (string | number | boolean | Record<string, unknown>)[],
    onRefresh?: () => void,
) => {
    const queryClient = useQueryClient()
    
    return useMutation<
        TaskLane,
        Error,
        { laneId: string; data: { name?: string; color?: string | null; order?: number; isDefault?: boolean } },
        { previousLanes?: TaskLane[] }
    >({
        mutationFn: async ({ laneId, data }) => {
            return await request<TaskLane>(`/lanes/${laneId}?teamId=${teamId}&projectId=${projectId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })
        },
        onMutate: async ({ laneId, data }) => {
            await queryClient.cancelQueries({ queryKey: activeQueryKey })
            
            const previousLanes = queryClient.getQueryData<TaskLane[]>(activeQueryKey)
            const nextLanes = (previousLanes || localLanes).map(lane =>
                lane.id === laneId ? { ...lane, ...data } : lane,
            )
            const sortedLanes = [...nextLanes].sort((a, b) => a.order - b.order)
            queryClient.setQueryData(activeQueryKey, sortedLanes)
            setLocalLanes(sortedLanes)
            
            return { previousLanes }
        },
        onError: (_error: Error, _vars, context: { previousLanes?: TaskLane[] } | undefined) => {
            if (context?.previousLanes)
                queryClient.setQueryData(activeQueryKey, context.previousLanes)
        },
        onSuccess: (updated: TaskLane) => {
            queryClient.setQueryData(activeQueryKey, (current?: TaskLane[]) =>
                (current || [])
                    .map((lane: TaskLane) => (lane.id === updated.id ? updated : lane))
                    .sort((a, b) => a.order - b.order),
            )
        },
        onSettled: () => {
            onRefresh?.()
        },
    })
}
