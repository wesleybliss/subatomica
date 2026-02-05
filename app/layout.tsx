// @ts-expect-error @todo add types
import * as reactWirePersisted from 'react-wire-persisted'
import './globals.css'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import type React from 'react'
import { preconnect } from 'react-dom'
import type { Metadata } from 'next'
import { NS } from '@/lib/constants'
import DebugTools from '@/components/debug/DebugTools'
import DebugClient from '@/components/debug/DebugClient'
import ThemeProvider from '@/components/ThemeProvider'
import QueryProvider from '@/components/QueryProvider'
import GlobalCommand from '@/components/dialogs/GlobalCommand/GlobalCommand'
import GlobalClient from '@/components/GlobalClient'

reactWirePersisted.setNamespace(NS)

const VERCEL_ANALYTICS_ENABLED = false

const geist = Geist({
    subsets: ['latin'],
    variable: '--font-geist',
})

const geistMono = Geist_Mono({
    subsets: ['latin'],
    variable: '--font-geist-mono',
})

preconnect('https://fonts.googleapis.com')
preconnect('https://fonts.gstatic.com', { crossOrigin: 'anonymous' })

export const metadata: Metadata = {
    title: 'Sub Atomica',
    description: 'Todo',
    icons: {
        icon: '/logos/sub-atomica-high-resolution-logo-grayscale-transparent-192.png',
        apple: '/logos/sub-atomica-high-resolution-logo-grayscale-transparent-192.png',
    },
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    
    return (
        
        <html lang="en" data-arp="" suppressHydrationWarning>
            
            <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased`}>
                
                <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
                    
                    <QueryProvider>
                        
                        {children}
                        
                        <GlobalClient />
                        <GlobalCommand />
                        
                        {VERCEL_ANALYTICS_ENABLED && <Analytics />}
                        
                        <DebugClient />
                        <DebugTools />
                    
                    </QueryProvider>
                
                </ThemeProvider>
            
            </body>
        
        </html>
        
    )
    
}
