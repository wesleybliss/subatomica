import { StoreAction } from '@repo/shared/types'
import { create } from 'zustand'

import { createSetterFns } from '@/lib/utils/store.utils'

interface DialogStore {
    globalCommandOpen: boolean
    setGlobalCommandOpen: StoreAction<boolean>
}

const initialValues = {
    globalCommandOpen: false,
} satisfies Partial<DialogStore>

export const useDialogStore = create<DialogStore>()(
    set => ({
        ...initialValues,
        ...createSetterFns<DialogStore>()(set, initialValues),
    }),
)
