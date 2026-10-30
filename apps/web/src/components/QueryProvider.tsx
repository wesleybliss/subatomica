import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

import { SyncProvider } from '@/components/sync/SyncProvider'

const client = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30_000,
            // Tier 0: refetch when the window regains focus
            refetchOnWindowFocus: true,
            // Tier 0: light poll while the tab is visible (Ably short-circuits via invalidate)
            refetchInterval: () => {
                // oxlint-disable-next-line no-restricted-globals
                if (typeof document === 'undefined') return false
                // oxlint-disable-next-line no-restricted-globals
                return document.visibilityState === 'visible' ? 15_000 : false
            },
            refetchIntervalInBackground: false,
        },
    },
})

export default function QueryProvider({ children }: { children: ReactNode }) {
    
    return (
        
        <QueryClientProvider client={client}>
            <SyncProvider>
                {children}
            </SyncProvider>
        </QueryClientProvider>
        
    )
    
}
