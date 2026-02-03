import { redirect } from 'next/navigation'
import type React from 'react'
import PrimarySidebar from '@/components/PrimarySidebar/PrimarySidebar'
import { getMockWorkspace } from '@/lib/constants'

export default async function WorkspaceSettingsLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ workspaceId: string }>
}) {
    const { workspaceId } = await params
    const workspace = getMockWorkspace(workspaceId)

    if (!workspace) {
        redirect('/')
    }

    return (
        <div className="flex h-screen overflow-hidden">
            <PrimarySidebar workspaceId={workspaceId} />
            {children}
        </div>
    )
}
