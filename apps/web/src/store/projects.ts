import { createSelector, createWire } from '@forminator/react-wire'
import type { Project } from '@repo/shared/types'

export const projects = createWire<Project[]>([])

export const selectedProjectSlug = createWire<string | null>(null)

export const selectedProject = createSelector<Project | null>({
    get: ({ get }) => get(projects)?.find(it => it.slug === get(selectedProjectSlug)) || null,
})

export const selectedProjectId = createSelector<string | null>({
    get: ({ get }) => get(selectedProject)?.id || null,
})
