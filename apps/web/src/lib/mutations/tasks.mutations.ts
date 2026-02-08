import { Task, CreateTaskInput, UpdateTaskOrderInput } from '@repo/shared/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { request } from '@/lib/api/client'

export const useCreateTaskMutation = (
    localTasks: Task[],
    setLocalTasks: (value: Task[]) => void,
    activeQueryKey: readonly (string | number | boolean | undefined | Record<string, unknown>)[],
    teamId?: string | null,
    projectId?: string | null,
    onRefresh?: () => void,
) => {
    
    const queryClient = useQueryClient()
    
    return useMutation<
        { created: Task; tempId: string },
        Error,
        CreateTaskInput,
        { previousTasks?: Task[] }
    >({
        mutationFn: async ({ status, tempId }: CreateTaskInput) => {
            const created = await request<Task>(`/teams/${teamId}/projects/${projectId}/tasks/${tempId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, tempId, projectId }),
            })
            return { created, tempId }
        },
        onMutate: async ({ status, tempId }: CreateTaskInput) => {
            
            if (!projectId)
                return { previousTasks: undefined }
            
            await queryClient.cancelQueries({ queryKey: activeQueryKey })
            
            const previousTasks = queryClient.getQueryData<Task[]>(activeQueryKey)
            const nextOrder = Math.max(
                0,
                ...localTasks
                    .filter(task => task.status === status)
                    .map(task => task.order),
            ) + 1000
            
            const optimisticTask: Task = {
                id: tempId,
                title: 'New Task',
                description: '',
                projectId,
                userId: 'pending',
                localId: 0,
                status,
                priority: null,
                dueDate: null,
                assigneeId: null,
                order: nextOrder,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                deletedAt: null,
            }
            
            const nextTasks = [...(previousTasks || localTasks), optimisticTask]
            queryClient.setQueryData(activeQueryKey, nextTasks)
            setLocalTasks(nextTasks)
            
            return { previousTasks }
            
        },
        onError: (_error: Error, _vars: CreateTaskInput, context: { previousTasks?: Task[] } | undefined) => {
            if (context?.previousTasks)
                queryClient.setQueryData(activeQueryKey, context.previousTasks)
        },
        onSuccess: ({ created, tempId }: { created: Task; tempId: string }) => {
            queryClient.setQueryData(activeQueryKey, (current?: Task[]) =>
                (current || []).map((task: Task) => (task.id === tempId ? created : task)),
            )
        },
        onSettled: () => {
            onRefresh?.()
        },
    })
    
}

export const useUpdateTaskOrderMutation = (
    localTasks: Task[],
    setLocalTasks: (value: Task[]) => void,
    activeQueryKey: readonly (string | number | boolean | undefined | Record<string, unknown>)[],
    teamId?: string,
    projectId?: string,
    onRefresh?: () => void,
) => {
    const queryClient = useQueryClient()
    
    return useMutation<Task, Error, UpdateTaskOrderInput, { previousTasks?: Task[] }>({
        mutationFn: async ({ taskId, status, order }: UpdateTaskOrderInput) => {
            const response = await request<Task>(`/teams/${teamId}/projects/${projectId}/tasks/${taskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, order }),
            })
            return response as Task
        },
        onMutate: async ({ taskId, status, order }: UpdateTaskOrderInput) => {
            await queryClient.cancelQueries({ queryKey: activeQueryKey })
            
            const previousTasks = queryClient.getQueryData<Task[]>(activeQueryKey)
            const nextTasks = (previousTasks || localTasks).map((task: Task) =>
                task.id === taskId
                    ? { ...task, status, order }
                    : task,
            )
            queryClient.setQueryData(activeQueryKey, nextTasks)
            setLocalTasks(nextTasks)
            return { previousTasks }
        },
        onError: (_error: Error, _vars: UpdateTaskOrderInput, context: { previousTasks?: Task[] } | undefined) => {
            if (context?.previousTasks)
                queryClient.setQueryData(activeQueryKey, context.previousTasks)
        },
        onSuccess: (updated: Task) => {
            queryClient.setQueryData(activeQueryKey, (current?: Task[]) =>
                (current || []).map((task: Task) => (task.id === updated.id ? updated : task)),
            )
        },
        onSettled: () => {
            onRefresh?.()
        },
    })
}
