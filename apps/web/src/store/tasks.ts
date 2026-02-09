import { createSelector, createWire } from '@forminator/react-wire'
import type { Task } from '@repo/shared/types'

export const tasks = createWire<Task[]>([])

export const selectedTaskSlug = createWire<string | null>(null)

export const selectedTask = createSelector<Task | null>({
    get: ({ get }) => get(tasks)?.find(it => it.slug === get(selectedTaskSlug)) || null,
})

export const selectedTaskId = createSelector<string | null>({
    get: ({ get }) => get(selectedTask)?.id || null,
})
