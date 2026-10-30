import { create } from 'zustand'

import {
    DEFAULT_KANBAN_DND_ENGINE,
    type KanbanDndEngine,
} from '@/lib/constants/kanban.constants'

interface KanbanUiStore {
    dndEngine: KanbanDndEngine
    setDndEngine: (engine: KanbanDndEngine) => void
    toggleDndEngine: () => void
}

export const useKanbanUiStore = create<KanbanUiStore>()(set => ({
    dndEngine: DEFAULT_KANBAN_DND_ENGINE,
    setDndEngine: engine => set({ dndEngine: engine }),
    toggleDndEngine: () => set(state => ({
        dndEngine: state.dndEngine === 'pragmatic' ? 'dnd-kit' : 'pragmatic',
    })),
}))
