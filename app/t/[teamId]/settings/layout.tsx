import { redirect } from 'next/navigation'
import type React from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { getProjects } from '@/lib/db/actions/projects'
import { getTeamById, getUserTeams } from '@/lib/db/actions/teams'
import { getCurrentUser } from '@/lib/db/actions/shared'

export default async function WorkspaceSettingsLayout({
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
    if (!team) {
        redirect('/')
    }
    const [teams, projects] = await Promise.all([
        getUserTeams(user.id, user),
        getProjects(teamId),
    ])
    return (
        <SidebarProvider>
            <AppSidebar
                teamId={teamId}
                teamName={team.name}
                teams={teams}
                projects={projects}
                user={user} />
            <SidebarInset className="flex-1 overflow-hidden">
                {children}
            </SidebarInset>
        </SidebarProvider>
    )
}
