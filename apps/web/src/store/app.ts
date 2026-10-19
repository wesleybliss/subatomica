import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { getStoreName } from '@/lib/constants'
import { createSetterFns } from '@/lib/utils/store.utils'

interface AppStore {
    primarySidebarWidth: string[]
    setPrimarySidebarWidth: (value: string[]) => void
    primarySidebarCollapsed: boolean
    setPrimarySidebarCollapsed: (value: boolean) => void
}

const initialValues = {
    primarySidebarWidth: [],
    primarySidebarCollapsed: false,
} satisfies Partial<AppStore>

export const useAppStore = create<AppStore>()(
    persist(
        set => ({
            ...initialValues,
            ...createSetterFns<AppStore>()(set, initialValues),
        }),
        { name: getStoreName('app') },
    ),
)
