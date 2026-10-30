import { DebugToolsMode, StoreAction } from '@repo/shared/types'
import { create } from 'zustand'

import { createSetterFns } from '@/lib/utils/store.utils'

export type DebugPanelSection = 'ably'

interface DebugStore {
    debugToolsMode: DebugToolsMode
    setDebugToolsMode: StoreAction<DebugToolsMode>
    debugPanelSection: DebugPanelSection
    setDebugPanelSection: StoreAction<DebugPanelSection>
}

const initialValues = {
    debugToolsMode: DebugToolsMode.minified,
    debugPanelSection: 'ably' as DebugPanelSection,
} satisfies Partial<DebugStore>

export const useDebugStore = create<DebugStore>()(
    set => ({
        ...initialValues,
        ...createSetterFns<DebugStore>()(set, initialValues),
    }),
)
