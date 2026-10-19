import { DebugToolsMode, StoreAction } from '@repo/shared/types'
import { create } from 'zustand'

import { createSetterFns } from '@/lib/utils/store.utils'

interface DebugStore {
    debugToolsMode: DebugToolsMode
    setDebugToolsMode: StoreAction<DebugToolsMode>
}

const initialValues = {
    debugToolsMode: DebugToolsMode.minified,
} satisfies Partial<DebugStore>

export const useDebugStore = create<DebugStore>()(
    set => ({
        ...initialValues,
        ...createSetterFns<DebugStore>()(set, initialValues),
    }),
)
