import type { Project } from '@repo/shared/types'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { getStoreName } from '@/lib/constants'
import { createSetterFns } from '@/lib/utils/store.utils'

interface ProjectStore {
    projects: Project[]
    setProjects: (value: Project[]) => void
    selectedProjectSlug: string | null
    setSelectedProjectSlug: (value: string | null) => void
    // selectedProject: Project | null
    // selectedProjectId: string | null
}

const initialValues = {
    projects: [],
    selectedProjectSlug: null,
    // selectedProject: null,
    // selectedProjectId: null,
} satisfies Partial<ProjectStore>

export const useProjectStore = create<ProjectStore>()(
    persist(
        set => ({
            ...initialValues,
            ...createSetterFns<ProjectStore>()(set, initialValues),
        }),
        {
            name: getStoreName('project'),
            partialize: state => ({
                selectedProjectSlug: state.selectedProjectSlug,
            }),
        },
    ),
)

/* export const selectedProject = createSelector<Project | null>({
    get: ({ get }) => get(projects)?.find(it => it.slug === get(selectedProjectSlug)) || null,
}) */
export const useSelectedProject = () =>
    useProjectStore(state =>
        state.projects.find(it => it.slug === state.selectedProjectSlug) ?? null,
    )

/* export const selectedProjectId = createSelector<string | null>({
    get: ({ get }) => get(selectedProject)?.id || null,
}) */
export const useSelectedProjectId = () => useSelectedProject()?.id
