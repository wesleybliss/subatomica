import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { getStoreName } from '@/lib/constants'
import { createSetterFns } from '@/lib/utils/store.utils'
import { StoreAction } from '@repo/shared/types'

interface AppStore {
    primarySidebarWidth: string[]
    setPrimarySidebarWidth: StoreAction<string[]>
    primarySidebarCollapsed: boolean
    setPrimarySidebarCollapsed: StoreAction<boolean>
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
