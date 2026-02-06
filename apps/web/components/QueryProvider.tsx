'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

const client = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
        },
    },
})

export default function QueryProvider({ children }: { children: ReactNode }) {
    
    return (
        
        <QueryClientProvider client={client}>
            {children}
        </QueryClientProvider>
        
    )
    
}
