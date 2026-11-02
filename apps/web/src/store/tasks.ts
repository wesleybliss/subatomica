import type { StoreAction, Task } from '@repo/shared/types'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { getStoreName } from '@/lib/constants'
import { useTasks } from '@/lib/queries/tasks.queries'
import { createSetterFns } from '@/lib/utils/store.utils'

import { useSelectedProjectId } from './projects'
import { useSelectedTeamId } from './teams'

interface TaskStore {
    selectedTaskSlug: string | null
    setSelectedTaskSlug: StoreAction<string | null>
}

const initialValues = {
    selectedTaskSlug: null,
} satisfies Partial<TaskStore>

export const useTaskStore = create<TaskStore>()(
    persist(
        set => ({
            ...initialValues,
            ...createSetterFns<TaskStore>()(set, initialValues),
        }),
        {
            name: getStoreName('task'),
            partialize: state => ({
                selectedTaskSlug: state.selectedTaskSlug,
            }),
        },
    ),
)

export const useSelectedTask = (): Task | null => {
    const selectedTaskSlug = useTaskStore(state => state.selectedTaskSlug)
    const teamId = useSelectedTeamId()
    const projectId = useSelectedProjectId()
    const tasks = useTasks(teamId ?? undefined, projectId ?? undefined)
    return tasks.find(it => it.key === selectedTaskSlug) ?? null
}

export const useSelectedTaskId = () => useSelectedTask()?.id
