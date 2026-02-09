import type { Team } from '@repo/shared/types'
import { FolderKanban, Settings2, Shapes } from 'lucide-react'
import * as React from 'react'
import { useLocation } from 'react-router-dom'

import { NavMain } from '@/components/NavMain'
import { NavUser } from '@/components/NavUser'
import { TeamSwitcher } from '@/components/TeamSwitcher'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from '@/components/ui/sidebar'

type AvatarUser = {
    name: string
    email: string
    image?: string | null
}

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
    teamId: string
    teamSlug: string
    teamName: string
    teams: Team[]
    user: AvatarUser
}

export function AppSidebar({
    teamId,
    teamSlug,
    teamName,
    teams,
    user,
    ...props
}: AppSidebarProps) {
    const location = useLocation()
    const pathname = location.pathname
    const navMain = [
        {
            title: 'Overview',
            url: `/t/${teamSlug}`,
            icon: FolderKanban,
            isActive: pathname === `/t/${teamSlug}`,
        },
        {
            title: 'All Projects',
            url: `/t/${teamSlug}/p`,
            icon: Shapes,
            isActive: pathname.startsWith(`/t/${teamSlug}/p`),
        },
        {
            title: 'Settings',
            url: `/t/${teamSlug}/settings`,
            icon: Settings2,
            isActive: pathname.startsWith(`/t/${teamSlug}/settings`),
        },
    ]
    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader className="p-1">
                <TeamSwitcher
                    teams={teams}
                    activeTeamId={teamId}
                    teamName={teamName} />
            </SidebarHeader>
            <SidebarContent className="p-1">
                <NavMain items={navMain} />
            </SidebarContent>
            <SidebarFooter className="p-1">
                <NavUser user={user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
