import { createSelector, createWire } from '@forminator/react-wire'
import type { Task, TaskLane } from '@/types'

export const tasks = createWire<Task[]>([])

export const selectedTaskId = createWire<string | null>(null)

export const selectedTask = createSelector<Task | null>({
    get: ({ get }) => get(tasks)?.find(it => it.id === get(selectedTaskId)) || null,
})

export const lanes = createWire<TaskLane[]>([])
