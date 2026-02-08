import * as React from 'react'
import { FolderKanban, Settings2, Shapes } from 'lucide-react'
import { useLocation } from 'react-router-dom'

import type { Team } from '@repo/shared/types'
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
    teamName: string
    teams: Team[]
    user: AvatarUser
}

export function AppSidebar({
    teamId,
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
            url: `/t/${teamId}`,
            icon: FolderKanban,
            isActive: pathname === `/t/${teamId}`,
        },
        {
            title: 'All Projects',
            url: `/t/${teamId}/p`,
            icon: Shapes,
            isActive: pathname.startsWith(`/t/${teamId}/p`),
        },
        {
            title: 'Settings',
            url: `/t/${teamId}/settings`,
            icon: Settings2,
            isActive: pathname.startsWith(`/t/${teamId}/settings`),
        },
    ]
    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader className="p-2">
                <TeamSwitcher
                    teams={teams}
                    activeTeamId={teamId}
                    teamName={teamName} />
            </SidebarHeader>
            <SidebarContent className="p-2">
                <NavMain items={navMain} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
