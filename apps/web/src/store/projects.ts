import { createSelector, createWire } from '@forminator/react-wire'
import type { Project } from '@repo/shared/types'

export const projects = createWire<Project[]>([])

export const selectedProjectId = createWire<string | null>(null)

export const selectedProject = createSelector<Project | null>({
    get: ({ get }) => get(projects)?.find(it => it.id === get(selectedProjectId)) || null,
})
