import { CreateProjectInput, Project } from '@repo/shared/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { request } from '@/lib/api/client'
import * as store from '@/store'

export const useCreateProjectMutation = (
    teamId: string,
    activeQueryKey: readonly (string | number | boolean | Record<string, unknown>)[],
) => {
    const queryClient = useQueryClient()
    const resolveName = (name?: string) => name?.trim() || 'New Project'
    const resolveSlug = (name?: string) => resolveName(name)
        .toLowerCase().replace(/\s+/g, '-')
    
    return useMutation<
        { created: Project; tempId: string },
        Error,
        CreateProjectInput,
        { previousProjects?: Project[] }
    >({
        mutationFn: async ({ name, tempId }: CreateProjectInput) => {
            if (!teamId)
                throw new Error('Missing team id')
            const created = await request<Project>('/projects?teamId=${teamId}', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: resolveName(name) }),
            })
            return { created, tempId }
        },
        onMutate: async ({ name, tempId }: CreateProjectInput) => {
            if (!teamId)
                return { previousProjects: undefined }
            
            await queryClient.cancelQueries({ queryKey: activeQueryKey })
            
            const previousProjects = queryClient.getQueryData<Project[]>(activeQueryKey)
            const now = new Date().toISOString()
            const optimisticProject: Project = {
                id: tempId,
                createdAt: now,
                updatedAt: now,
                ownerId: 'pending',
                teamId,
                name: resolveName(name),
                slug: resolveSlug(name),
                taskSequence: 1,
                description: '',
            }
            const nextProjects = [...(previousProjects || store.projects.getValue() || []), optimisticProject]
            queryClient.setQueryData(activeQueryKey, nextProjects)
            store.projects.setValue(nextProjects)
            
            return { previousProjects }
        },
        onError: (_error: Error, _vars: CreateProjectInput, context: { previousProjects?: Project[] } | undefined) => {
            if (context?.previousProjects) {
                queryClient.setQueryData(activeQueryKey, context.previousProjects)
                store.projects.setValue(context.previousProjects)
            }
        },
        onSuccess: ({ created, tempId }: { created: Project; tempId: string }) => {
            queryClient.setQueryData(activeQueryKey, (current?: Project[]) =>
                (current || []).map((project: Project) => (project.id === tempId ? created : project)),
            )
            const currentStoreProjects = store.projects.getValue() || []
            store.projects.setValue(
                currentStoreProjects.map(project => (project.id === tempId ? created : project)),
            )
        },
    })
}
