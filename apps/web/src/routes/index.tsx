// @ts-expect-error @todo add types
// import { Analytics } from '@vercel/analytics/next'
import { preconnect } from 'react-dom'
import { Navigate,Outlet, Route, Routes } from 'react-router-dom'
import * as reactWirePersisted from 'react-wire-persisted'

import DebugClient from '@/components/debug/DebugClient'
import DebugTools from '@/components/debug/DebugTools'
import GlobalCommand from '@/components/dialogs/GlobalCommand/GlobalCommand'
import GlobalClient from '@/components/GlobalClient'
import ProtectedRoute from '@/components/ProtectedRoute'
import QueryProvider from '@/components/QueryProvider'
import ThemeProvider from '@/components/ThemeProvider'
import { useSession } from '@/lib/auth-client'
import { NS } from '@/lib/constants'
import DashboardPage from '@/routes/dashboard/page'
import DebugPage from '@/routes/debug/page'
import ProjectDetailPage from '@/routes/project/page'
import ProjectsLayout from '@/routes/projects/ProjectsLayout'
import TeamProjectsPage from '@/routes/projects/ProjectsPage'
import SignInPage from '@/routes/sign-in/page'
import SignUpPage from '@/routes/sign-up/page'
import TeamLayout from '@/routes/team/TeamLayout'
import TeamPage from '@/routes/team/TeamPage'
import TeamsLayout from '@/routes/teams/TeamsLayout'
import TeamsPage from '@/routes/teams/TeamsPage'

reactWirePersisted.setNamespace(NS)

// const VERCEL_ANALYTICS_ENABLED = false

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

const LandingPage = () => (
    <>
        <h1>@todo Landing page</h1>
        <a href="/sign-in">Sign In</a>
    </>
)

const GlobalLayout = () => (
    <>
        <Outlet />
        <GlobalClient />
        <GlobalCommand />
        <DebugClient />
        <DebugTools />
    </>
)

export default function RootLayout() {
    
    const { data: session, isPending } = useSession()
    
    if (isPending)
        return null
    
    return (
        
        <ThemeProvider defaultTheme="system">
            
            <QueryProvider>
                
                <Routes>
                    
                    <Route element={<GlobalLayout />}>
                        
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
                                    
                                    <Route path="p" element={<ProjectsLayout />}>
                                        
                                        <Route index element={<TeamProjectsPage />} />
                                        
                                        <Route path=":projectId" element={<ProjectDetailPage />} />
                                    
                                    </Route>
                                
                                </Route>
                            
                            </Route>
                        
                        </Route>
                    
                    </Route>
                
                </Routes>
                
                {/*{VERCEL_ANALYTICS_ENABLED && <Analytics />}*/}
            
            </QueryProvider>
        
        </ThemeProvider>
        
    )
    
}
