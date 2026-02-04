import { redirect } from 'next/navigation'
import type React from 'react'
import PrimarySidebar from '@/components/PrimarySidebar/PrimarySidebar'
import { getTeamById } from '@/lib/constants'

export default async function TeamLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ teamId: string }>
}) {
    const { teamId } = await params
    const team = getTeamById(teamId)

    if (!team) redirect('/')

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <PrimarySidebar teamId={teamId} />
            <div className="flex-1 overflow-hidden">{children}</div>
        </div>
    )
}
