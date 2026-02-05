import type React from 'react'
import { redirect } from 'next/navigation'

import { AppSidebar } from '@/components/AppSidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { getTeamById, getUserTeams } from '@/lib/db/actions/teams'
import { getCurrentUser } from '@/lib/db/actions/shared'
import { getGravatarUrl } from '@/lib/gravatar'

export default async function TeamLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ teamId: string }>
}) {
    const { teamId } = await params
    const [team, user] = await Promise.all([
        getTeamById(teamId),
        getCurrentUser(),
    ])
    if (!team) redirect('/')
    const avatarUrl = getGravatarUrl(user.email ?? '')
    const teams = await getUserTeams(user.id, user)
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
