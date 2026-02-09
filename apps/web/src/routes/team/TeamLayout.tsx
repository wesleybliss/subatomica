import { useWireValue } from '@forminator/react-wire'
import { Team } from '@repo/shared/types'
import { useMemo } from 'react'
import { useNavigate,useParams } from 'react-router-dom'
import { Outlet } from 'react-router-dom'

import { AppSidebar } from '@/components/AppSidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { useSession } from '@/lib/auth-client'
import { getGravatarUrl } from '@/lib/gravatar'
import * as store from '@/store'

export default function TeamLayout() {
    
    const navigate = useNavigate()
    
    const session = useSession()
    const user = session.data?.user
    
    const params = useParams()
    const teamId: string | null = params.teamId as string
    
    const teams = useWireValue(store.teams)
    
    const team = useMemo<Team | undefined>(() => (
        teams?.find(it => it.id === teamId)
    ), [teams, teamId])
    
    if (!user) navigate('/sign-in', { replace: true })
    if (!teamId) navigate('/', { replace: true })
    
    const avatarUrl = getGravatarUrl(user?.email ?? '')
    const avatarUser = {
        name: user!.name,
        email: user!.email,
        image: avatarUrl,
    }
    
    if (!team) return <div>@todo TeamLayout no team ({teamId})</div>
    
    return (
        
        <SidebarProvider>
            
            <AppSidebar
                teamId={teamId}
                teamName={team.name}
                teams={teams}
                user={avatarUser} />
            
            <SidebarInset className="flex-1 overflow-hidden flex flex-col">
                <Outlet />
            </SidebarInset>
        
        </SidebarProvider>
        
    )
    
}
