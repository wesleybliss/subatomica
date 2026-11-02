import { CreateTaskInput, Task, UpdateTaskOrderInput } from '@repo/shared/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { request } from '@/lib/api/client'
import { clearDirtyTasks, markDirtyTask } from '@/lib/sync/dirtyStore'
import { hybridClock } from '@/lib/sync/hlc'

interface UpdateTaskData {
    title?: string
    description?: string
    assigneeId?: string
    status?: string
    order?: number
}

type TasksQueryKey = readonly (string | number | boolean | undefined | Record<string, unknown>)[]

export const useCreateTaskMutation = (
    activeQueryKey: TasksQueryKey,
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
            const queryParams = new URLSearchParams()
            if (teamId) queryParams.append('teamId', teamId)
            if (projectId) queryParams.append('projectId', projectId)
            const queryString = queryParams.toString()
            const url = queryString ? `/tasks/${tempId}?${queryString}` : `/tasks/${tempId}`
            
            const created = await request<Task>(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, tempId }),
            })
            return { created, tempId }
        },
        onMutate: async ({ status, tempId }: CreateTaskInput) => {
            
            if (!projectId)
                return { previousTasks: undefined }
            
            await queryClient.cancelQueries({ queryKey: activeQueryKey })
            
            const previousTasks = queryClient.getQueryData<Task[]>(activeQueryKey) ?? []
            const nextOrder = Math.max(
                0,
                ...previousTasks
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
                isStarred: false,
                key: '',
            }
            
            queryClient.setQueryData(activeQueryKey, [...previousTasks, optimisticTask])
            
            return { previousTasks }
            
        },
        onError: (_error: Error, vars: CreateTaskInput, context: { previousTasks?: Task[] } | undefined) => {
            if (context?.previousTasks)
                queryClient.setQueryData(activeQueryKey, context.previousTasks)
            if (teamId && projectId) {
                void markDirtyTask(teamId, projectId, {
                    id: vars.tempId,
                    updatedAt: hybridClock.nowIso(),
                    status: vars.status,
                })
            }
        },
        onSuccess: ({ created, tempId }: { created: Task; tempId: string }) => {
            hybridClock.receive(created.updatedAt)
            queryClient.setQueryData(activeQueryKey, (current?: Task[]) =>
                (current || []).map((task: Task) => (task.id === tempId ? created : task)),
            )
        },
        onSettled: () => {
            onRefresh?.()
        },
    })
    
}

export type MoveTaskVariables = UpdateTaskOrderInput & {
    /** Full board snapshot for DnD projections that renumber multiple tasks */
    optimisticTasks?: Task[]
}

export const useUpdateTaskOrderMutation = (
    activeQueryKey: TasksQueryKey,
    teamId?: string,
    projectId?: string,
    onRefresh?: () => void,
) => {
    const queryClient = useQueryClient()
    
    return useMutation<Task, Error, MoveTaskVariables, { previousTasks?: Task[] }>({
        mutationFn: async ({ taskId, status, order }: MoveTaskVariables) => {
            const queryParams = new URLSearchParams()
            if (teamId) queryParams.append('teamId', teamId)
            if (projectId) queryParams.append('projectId', projectId)
            const queryString = queryParams.toString()
            const url = queryString ? `/tasks/${taskId}?${queryString}` : `/tasks/${taskId}`
            
            const response = await request<Task>(url, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, order }),
            })
            return response as Task
        },
        onMutate: async ({ taskId, status, order, optimisticTasks }: MoveTaskVariables) => {
            await queryClient.cancelQueries({ queryKey: activeQueryKey })
            
            const updatedAt = hybridClock.nowIso()
            const previousTasks = queryClient.getQueryData<Task[]>(activeQueryKey)
            const nextTasks = optimisticTasks
                ? optimisticTasks.map((task: Task) =>
                    task.id === taskId ? { ...task, updatedAt } : task,
                )
                : (previousTasks || []).map((task: Task) =>
                    task.id === taskId
                        ? { ...task, status, order, updatedAt }
                        : task,
                )
            queryClient.setQueryData(activeQueryKey, nextTasks)
            
            if (teamId && projectId) {
                void markDirtyTask(teamId, projectId, {
                    id: taskId,
                    updatedAt,
                    status,
                    order,
                })
            }
            
            return { previousTasks }
        },
        onError: (_error: Error, _vars: MoveTaskVariables, context: { previousTasks?: Task[] } | undefined) => {
            if (context?.previousTasks)
                queryClient.setQueryData(activeQueryKey, context.previousTasks)
        },
        onSuccess: (updated: Task) => {
            hybridClock.receive(updated.updatedAt)
            void clearDirtyTasks([updated.id])
            queryClient.setQueryData(activeQueryKey, (current?: Task[]) =>
                (current || []).map((task: Task) => (task.id === updated.id ? updated : task)),
            )
        },
        onSettled: () => {
            onRefresh?.()
        },
    })
}

interface UpdateTaskDetailInput {
    taskId: string
    data: UpdateTaskData
}

export const useUpdateTaskMutation = (
    teamId?: string | null,
    projectId?: string | null,
    onSuccess?: (task: Task) => void,
) => {
    const queryClient = useQueryClient()
    const key = ['tasks', teamId, projectId]
    
    return useMutation<Task, Error, UpdateTaskDetailInput>({
        mutationFn: async ({ taskId, data }: UpdateTaskDetailInput) => {
            const queryParams = new URLSearchParams()
            if (teamId) queryParams.append('teamId', teamId)
            if (projectId) queryParams.append('projectId', projectId)
            const queryString = queryParams.toString()
            const url = queryString ? `/tasks/${taskId}?${queryString}` : `/tasks/${taskId}`
            
            const response = await request<Task>(url, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })
            return response
        },
        onSuccess: (updated: Task) => {
            queryClient.setQueryData(key, (current?: Task[]) =>
                (current || []).map((task: Task) => (task.id === updated.id ? updated : task)),
            )
            onSuccess?.(updated)
        },
    })
}
