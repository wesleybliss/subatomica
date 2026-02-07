import { useParams, useNavigate } from 'react-router-dom'
import { useMemo } from 'react'
import * as store from '@/store'
import type React from 'react'
import { AppSidebar } from '@/components/AppSidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { getGravatarUrl } from '@/lib/gravatar'
import { useSession } from '@/lib/auth-client'
import { Outlet } from 'react-router-dom'
import { useWireValue } from '@forminator/react-wire'
import { Team } from '@repo/shared/types'

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
    
    if (!teamId) navigate('/', { replace: true })
    
    const avatarUrl = getGravatarUrl(user?.email ?? '')
    
    if (!team) return <div>@todo TeamLayout no team ({teamId})</div>
    
    return (
        
        <SidebarProvider>
            
            <AppSidebar
                teamId={teamId}
                teamName={team.name}
                teams={teams}
                user={{ ...user, image: avatarUrl }} />
            
            <SidebarInset className="flex-1 overflow-hidden flex flex-col">
                <Outlet />
            </SidebarInset>
        
        </SidebarProvider>
        
    )
    
}
