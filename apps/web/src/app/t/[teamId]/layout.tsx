import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import type React from 'react'
import { AppSidebar } from '@/components/AppSidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { getTeamById, getUserTeams } from '@/lib/queries/teams.queries'
import { getGravatarUrl } from '@/lib/gravatar'
import { useSession } from '@/lib/auth-client'
import { Team } from '@repo/shared/types'

export default function TeamLayout({ children, }: { children: React.ReactNode }) {
    
    const navigate = useNavigate()
    
    const session = useSession()
    const user = session.data?.user!
    
    const [team, setTeam] = useState<Team | null>(null)
    const [teams, setTeams] = useState<Team[]>([])
    
    const params = useParams()
    const teamId: string | null = params.teamId as string
    
    useEffect(() => {
        
        if (!teamId) return
        
        getUserTeams()
            .then(it => setTeams(it))
            .catch(e => console.error(e))
        
        getTeamById(teamId)
            .then(it => setTeam(it))
            .catch(e => console.error(e))
        
    }, [teamId])
    
    if (!teamId) navigate('/', { replace: true })
    
    const avatarUrl = getGravatarUrl(user?.email ?? '')
    
    if (!team) return null
    
    return (
        
        <SidebarProvider>
            
            <AppSidebar
                teamId={teamId}
                teamName={team.name}
                teams={teams}
                user={{ ...user, image: avatarUrl }} />
            
            <SidebarInset className="flex-1 overflow-hidden flex flex-col">
                {children}
            </SidebarInset>
        
        </SidebarProvider>
        
    )
    
}
