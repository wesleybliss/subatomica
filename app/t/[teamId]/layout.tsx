import type React from 'react'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { getProjects, renameProject } from '@/lib/db/actions/projects'
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
    const renameProjectAction = async (projectId: string, name: string) => {
        'use server'
        await renameProject(projectId, name)
        revalidatePath(`/t/${teamId}`)
        revalidatePath(`/t/${teamId}/p`)
    }
    const avatarUrl = getGravatarUrl(user.email ?? '')
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
                user={{ ...user, image: avatarUrl }}
                onRenameProject={renameProjectAction} />
            <SidebarInset className="flex-1 overflow-hidden flex flex-col">
                {children}
            </SidebarInset>
        </SidebarProvider>
    )
}
