import { Task, CreateTaskInput } from '@/types'
import { createTask } from '@/lib/db/actions/tasks'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const useCreateTaskMutation = (
    localTasks: Task[],
    setLocalTasks: (value: Task[]) => void,
    activeQueryKey: readonly (string | number | boolean | Record<string, unknown>)[],
    projectId?: string | null | undefined,
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
            const created = await createTask({
                title: 'New Task',
                description: '',
                projectId: projectId as string,
                status,
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

export default useCreateTaskMutation
