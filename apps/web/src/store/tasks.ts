import type { StoreAction, Task } from '@repo/shared/types'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { getStoreName } from '@/lib/constants'
import { createSetterFns } from '@/lib/utils/store.utils'

interface TaskStore {
    tasks: Task[]
    setTasks: StoreAction<Task[]>
    selectedTaskSlug: string | null
    setSelectedTaskSlug: StoreAction<string | null>
    // selectedTask: Task | null
    // selectedTaskId: string | null
}

const initialValues = {
    tasks: [],
    selectedTaskSlug: null,
    // selectedTask: null,
    // selectedTaskId: null,
} satisfies Partial<TaskStore>

export const useTaskStore = create<TaskStore>()(
    persist(
        set => ({
            ...initialValues,
            ...createSetterFns<TaskStore>()(set, initialValues),
        }),
        {
            name: getStoreName('project'),
            partialize: state => ({
                selectedTaskSlug: state.selectedTaskSlug,
            }),
        },
    ),
)

export const useSelectedTask = () =>
    useTaskStore(state =>
        state.tasks.find(it => it.slug === state.selectedTaskSlug) ?? null,
    )

export const useSelectedTaskId = () => useSelectedTask()?.id
