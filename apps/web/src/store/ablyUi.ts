import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AblyUiStore {
    /** Client Ably subscribe/connect. Default off to protect free-tier quota. */
    ablyEnabled: boolean
    setAblyEnabled: (enabled: boolean) => void
}

export const useAblyUiStore = create<AblyUiStore>()(
    persist(
        set => ({
            ablyEnabled: false,
            setAblyEnabled: enabled => set({ ablyEnabled: enabled }),
        }),
        { name: 'subatomica-ably-ui' },
    ),
)
