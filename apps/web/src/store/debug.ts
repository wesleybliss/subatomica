import { DebugToolsMode } from '@repo/shared/types'
import { create } from 'zustand'

import { createSetterFns } from '@/lib/utils/store.utils'

interface DebugStore {
    debugToolsMode: DebugToolsMode
    setDebugToolsMode: (value: DebugToolsMode) => void
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
