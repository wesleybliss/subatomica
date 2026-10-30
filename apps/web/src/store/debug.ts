import { DebugToolsMode, StoreAction } from '@repo/shared/types'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { getStoreName } from '@/lib/constants'
import { DEFAULT_KANBAN_DND_ENGINE, KanbanDndEngine } from '@/lib/constants/kanban.constants'
import { createSetterFns } from '@/lib/utils/store.utils'

export type DebugPanelSection = 'ably' | 'kanban'

interface DebugStore {
    debugToolsMode: DebugToolsMode
    setDebugToolsMode: StoreAction<DebugToolsMode>
    debugPanelSection: DebugPanelSection
    setDebugPanelSection: StoreAction<DebugPanelSection>
    kanbanDndEngine: KanbanDndEngine
    setKanbanDndEngine: StoreAction<KanbanDndEngine>
}

const initialValues = {
    debugToolsMode: DebugToolsMode.minified,
    debugPanelSection: 'ably' as DebugPanelSection,
    kanbanDndEngine: DEFAULT_KANBAN_DND_ENGINE,
} satisfies Partial<DebugStore>

export const useDebugStore = create<DebugStore>()(
    persist(
        set => ({
            ...initialValues,
            ...createSetterFns<DebugStore>()(set, initialValues),
        }),
        {
            name: getStoreName('debug'),
            // 👇 Only persist these specific keys
            partialize: state => ({ 
                kanbanDndEngine: state.kanbanDndEngine,
            }),
        },
    ),
)
