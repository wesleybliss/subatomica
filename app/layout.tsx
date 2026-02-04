import { Analytics } from '@vercel/analytics/next'
import type React from 'react'
import './globals.css'
import type { Metadata } from 'next'
// @ts-expect-error
import * as reactWirePersisted from 'react-wire-persisted'
import DebugTools from '@/components/debug/DebugTools'
import { NS } from '@/lib/constants'

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

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en" data-arp="" className="dark">
            <head>
                <title>Sub Atomica</title>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

                <link
                    href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@100..900&family=Geist:wght@100..900&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body className={`font-sans antialiased`}>
                {children}

                {VERCEL_ANALYTICS_ENABLED && <Analytics />}
                
                <DebugTools />
            </body>
        </html>
    )
}
