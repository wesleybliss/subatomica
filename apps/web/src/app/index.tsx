// @ts-expect-error @todo add types
import * as reactWirePersisted from 'react-wire-persisted'
// import { Analytics } from '@vercel/analytics/next'
import type React from 'react'
import { preconnect } from 'react-dom'
import { NS } from '@/lib/constants'
import { Routes, Route, Outlet, Navigate } from 'react-router'
import DebugTools from '@/components/debug/DebugTools'
import DebugClient from '@/components/debug/DebugClient'
import ThemeProvider from '@/components/ThemeProvider'
import QueryProvider from '@/components/QueryProvider'
import GlobalCommand from '@/components/dialogs/GlobalCommand/GlobalCommand'
import GlobalClient from '@/components/GlobalClient'
import DashboardPage from '@/app/dashboard/page'
import DebugPage from '@/app/debug/page'
import SignUpPage from '@/app/sign-up/page'
import SignInPage from '@/app/sign-in/page'
import TeamsPage from '@/app/t/page'
import TeamPage from '@/app/t/[teamId]/page'
import TeamProjectsPage from '@/app/t/[teamId]/p/page'
import ProjectDetailPage from '@/app/t/[teamId]/p/[projectId]/page'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useSession } from '@/lib/auth-client'
import TeamsLayout from '@/app/t/layout'
import TeamLayout from '@/app/t/[teamId]/layout'
import TeamProjectsLayout from '@/app/t/[teamId]/p/layout'

reactWirePersisted.setNamespace(NS)

const VERCEL_ANALYTICS_ENABLED = false

/*const geist = Geist({
    subsets: ['latin'],
    variable: '--font-geist',
})

const geistMono = Geist_Mono({
    subsets: ['latin'],
    variable: '--font-geist-mono',
})*/

preconnect('https://fonts.googleapis.com')
preconnect('https://fonts.gstatic.com', { crossOrigin: 'anonymous' })

// @todo
export const metadata = {
    title: 'Sub Atomica',
    description: 'Todo',
    icons: {
        icon: '/logos/sub-atomica-high-resolution-logo-grayscale-transparent-192.png',
        apple: '/logos/sub-atomica-high-resolution-logo-grayscale-transparent-192.png',
    },
}

const AuthLayout = () => (
    <Outlet />
)

const LandingPage = () => (
    <>
        <h1>@todo Landing page</h1>
        <a href="/sign-in">Sign In</a>
    </>
)

export default function RootLayout() {
    
    const { data: session, isPending } = useSession()
    
    if (isPending)
        return null
    
    return (
        
        <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
            
            <QueryProvider>
                
                <Routes>
                    
                    <Route index element={session ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
                    <Route path="sign-up" element={<SignUpPage />} />
                    <Route path="sign-in" element={<SignInPage />} />
                    
                    <Route element={<ProtectedRoute />}>
                        
                        <Route path="dashboard" element={<DashboardPage />} />
                        <Route path="debug" element={<DebugPage />} />
                        
                        <Route path="t" element={<TeamsLayout />}>
                            
                            <Route index element={<TeamsPage />} />
                            
                            <Route path=":teamId" element={<TeamLayout />}>
                                
                                <Route index element={<TeamPage />} />
                                
                                <Route path="p" element={<TeamProjectsLayout />}>
                                    
                                    <Route index element={<TeamProjectsPage />} />
                                    
                                    <Route path=":projectId" element={<ProjectDetailPage />}>
                                        
                                        <Route index element={<ProjectDetailPage />} />
                                        {/* @todo task page */}
                                    
                                    </Route>
                                
                                </Route>
                            
                            </Route>
                        
                        </Route>
                    
                    </Route>
                
                </Routes>
                
                <GlobalClient />
                <GlobalCommand />
                
                {/*{VERCEL_ANALYTICS_ENABLED && <Analytics />}*/}
                
                <DebugClient />
                <DebugTools />
            
            </QueryProvider>
        
        </ThemeProvider>
        
    )
    
}
