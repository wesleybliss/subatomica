import { redirect } from 'next/navigation'
import type React from 'react'
import { getTeamById } from '@/lib/db/actions/teams'

export default async function WorkspaceSettingsLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ teamId: string }>
}) {
    const { teamId } = await params
    const team = await getTeamById(teamId)
    if (!team) {
        redirect('/')
    }
    return children
}