import { redirect } from 'next/navigation'
import type React from 'react'
import PrimarySidebar from '@/components/PrimarySidebar/PrimarySidebar'
import { getTeamById } from '@/lib/db/actions/teams'

export default async function WorkspaceNotebooksLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ teamId: string }>
}) {
    const { teamId } = await params
    const team = await getTeamById(teamId)
    
    if (!team)
        redirect('/')
    
    return (
        <div className="flex h-screen overflow-hidden">
            <PrimarySidebar teamId={teamId} />
            {children}
        </div>
    )
}
