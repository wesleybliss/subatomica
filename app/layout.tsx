import { Analytics } from '@vercel/analytics/next'
import type React from 'react'
import './globals.css'
import type { Metadata } from 'next'
// @ts-expect-error @todo add types
import * as reactWirePersisted from 'react-wire-persisted'
import DebugTools from '@/components/debug/DebugTools'
import { NS } from '@/lib/constants'
import DebugClient from '@/components/DebugClient'
import ThemeProvider from '@/components/ThemeProvider'
import ThemeToggle from '@/components/ThemeToggle'
import QueryProvider from '@/components/QueryProvider'

reactWirePersisted.setNamespace(NS)

const VERCEL_ANALYTICS_ENABLED = false

export const metadata: Metadata = {
    title: 'Sub Atomica',
    description: 'Todo',
    icons: {
        icon: '/logos/sub-atomica-high-resolution-logo-grayscale-transparent-192.png',
        apple: '/logos/sub-atomica-high-resolution-logo-grayscale-transparent-192.png',
    },
}

type GoogleFontUrlDefinition = {
    family: string
    weightStart: number
    weightEnd: number
}

const googleFontUrl = (definitions: GoogleFontUrlDefinition[]) => {
    
    const fonts = definitions
        .map(it => `${it.family}:wght@${it.weightStart}..${it.weightEnd}`)
        .join('&')
    
    return `https://fonts.googleapis.com/css2?family=${fonts}&display=swap`
    
}

const fonts = googleFontUrl([
    { family: 'Geist', weightStart: 100, weightEnd: 900 },
    { family: 'Geist+Mono', weightStart: 100, weightEnd: 900 },
])

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    
    return (
        <html lang="en" data-arp="" suppressHydrationWarning>
            <head>
                <title>Sub Atomica</title>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                
                <link href={fonts} rel="stylesheet" />
            </head>
            <body className={'font-sans antialiased'}>
                <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
                    <QueryProvider>
                        {children}
                        <ThemeToggle />
                        {VERCEL_ANALYTICS_ENABLED && <Analytics />}
                        <DebugClient />
                        <DebugTools />
                    </QueryProvider>
                </ThemeProvider>
            </body>
        </html>
    )
    
}
