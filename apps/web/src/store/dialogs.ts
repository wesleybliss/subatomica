import { create } from 'zustand'

import { createSetterFns } from '@/lib/utils/store.utils'

interface DialogStore {
    globalCommandOpen: boolean
    setGlobalCommandOpen: (value: boolean) => void
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
