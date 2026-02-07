import type { TaskLane } from '@repo/shared/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export const useCreateTaskLaneMutation = (
    localLanes: TaskLane[],
    setLocalLanes: (value: TaskLane[]) => void,
    activeQueryKey: readonly (string | number | boolean | Record<string, unknown>)[],
    projectId?: string | null | undefined,
    onRefresh?: () => void,
) => {
    const queryClient = useQueryClient()

    return useMutation<
        { created: TaskLane; tempId: string },
        Error,
        { name?: string; color?: string | null; tempId: string },
        { previousLanes?: TaskLane[] }
    >({
        mutationFn: async ({ name, color, tempId }) => {
            if (!projectId)
                throw new Error('Missing project id')
            const response = await fetch('/lanes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId, name, color, tempId }),
            })
            if (!response.ok)
                throw new Error('Failed to fetch lanes')
            const created = await response.json() as TaskLane
            return { created, tempId }
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
            const response = await fetch(`/api/lanes/${laneId}`, {
                method: 'DELETE',
            })
            if (!response.ok)
                throw new Error('Failed to fetch lanes')
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
            const response = await fetch(`/api/lanes/${laneId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })
            if (!response.ok)
                throw new Error('Failed to fetch lanes')
            return await response.json() as TaskLane
        },
        onMutate: async ({ laneId, data }) => {
            await queryClient.cancelQueries({ queryKey: activeQueryKey })

            const previousLanes = queryClient.getQueryData<TaskLane[]>(activeQueryKey)
            const nextLanes = (previousLanes || localLanes).map(lane =>
                lane.id === laneId ? { ...lane, ...data } : lane,
            )
            queryClient.setQueryData(activeQueryKey, nextLanes)
            setLocalLanes(nextLanes)

            return { previousLanes }
        },
        onError: (_error: Error, _vars, context: { previousLanes?: TaskLane[] } | undefined) => {
            if (context?.previousLanes)
                queryClient.setQueryData(activeQueryKey, context.previousLanes)
        },
        onSuccess: (updated: TaskLane) => {
            queryClient.setQueryData(activeQueryKey, (current?: TaskLane[]) =>
                (current || []).map((lane: TaskLane) => (lane.id === updated.id ? updated : lane)),
            )
        },
        onSettled: () => {
            onRefresh?.()
        },
    })
}
