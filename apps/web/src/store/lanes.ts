import type { StoreAction, TaskLane } from '@repo/shared/types'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { getStoreName } from '@/lib/constants'
import { createSetterFns } from '@/lib/utils/store.utils'

interface LaneStore {
    lanes: TaskLane[]
    setLanes: StoreAction<TaskLane[]>
    collapsedLanes: string[]
    setCollapsedLanes: StoreAction<string[]>
}

const initialValues = {
    lanes: [],
    collapsedLanes: [],
} satisfies Partial<LaneStore>

export const useLaneStore = create<LaneStore>()(
    persist(
        set => ({
            ...initialValues,
            ...createSetterFns<LaneStore>()(set, initialValues),
        }),
        {
            name: getStoreName('lane'),
            partialize: state => ({
                collapsedLanes: state.collapsedLanes,
            }),
        },
    ),
)
