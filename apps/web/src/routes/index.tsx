import { preconnect } from 'react-dom'
import { Outlet, Route, Routes } from 'react-router-dom'

import DebugTools from '@/components/debug/DebugTools'
import GlobalCommand from '@/components/dialogs/GlobalCommand/GlobalCommand'
import GlobalClient from '@/components/GlobalClient'
import ProtectedRoute from '@/components/ProtectedRoute'
import QueryProvider from '@/components/QueryProvider'
import ThemeProvider from '@/components/ThemeProvider'
import useDebug from '@/hooks/useDebug'
import { useSession } from '@/lib/auth-client'
import DebugPage from '@/routes/debug/page'
import LandingPage from '@/routes/landing'
import HomePage from '@/routes/page'
import ProjectDetailPage from '@/routes/project/page'
import ProjectsLayout from '@/routes/projects/ProjectsLayout'
import TeamProjectsPage from '@/routes/projects/ProjectsPage'
import SettingsLayout from '@/routes/settings/SettingsLayout'
import SettingsPage from '@/routes/settings/SettingsPage'
import SignInPage from '@/routes/sign-in/page'
import SignUpPage from '@/routes/sign-up/page'
import TeamLayout from '@/routes/team/TeamLayout'
import TeamPage from '@/routes/team/TeamPage'
import TeamSettingsLayout from '@/routes/team-settings/TeamSettingsLayout'
import TeamSettingsPage from '@/routes/team-settings/TeamSettingsPage'
import TeamsLayout from '@/routes/teams/TeamsLayout'
import TeamsPage from '@/routes/teams/TeamsPage'

// const VERCEL_ANALYTICS_ENABLED = false

preconnect('https://fonts.googleapis.com')
preconnect('https://fonts.gstatic.com', { crossOrigin: 'anonymous' })

const GlobalLayout = () => (
    <>
        <Outlet />
        <GlobalClient />
        <GlobalCommand />
        <DebugTools />
    </>
)

export default function RootLayout() {
    
    const { data: session, isPending } = useSession()
    
    useDebug()
    
    if (isPending)
        return null
    
    return (
        
        <ThemeProvider defaultTheme="system">
            
            <QueryProvider>
                
                <Routes>
                    
                    <Route element={<GlobalLayout />}>
                        
                        <Route index element={session ? <HomePage /> : <LandingPage />} />
                        <Route path="sign-up" element={<SignUpPage />} />
                        <Route path="sign-in" element={<SignInPage />} />
                        
                        <Route element={<ProtectedRoute />}>
                            
                            <Route path="debug" element={<DebugPage />} />
                            
                            <Route path="settings" element={<SettingsLayout />}>
                                <Route index element={<SettingsPage />} />
                            </Route>
                            
                            <Route path="t" element={<TeamsLayout />}>
                                
                                <Route index element={<TeamsPage />} />
                                
                                <Route path=":teamSlug" element={<TeamLayout />}>
                                    
                                    <Route index element={<TeamPage />} />
                                    
                                    <Route path="settings" element={<TeamSettingsLayout />}>
                                        <Route index element={<TeamSettingsPage />} />
                                    </Route>
                                    
                                    <Route path="p" element={<ProjectsLayout />}>
                                        
                                        <Route index element={<TeamProjectsPage />} />
                                        
                                        <Route path=":projectSlug" element={<ProjectDetailPage />} />
                                    
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
