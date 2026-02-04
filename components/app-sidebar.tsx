'use client'

import * as React from 'react'
import { FolderKanban, LayoutGrid, Settings2, Shapes } from 'lucide-react'
import { usePathname } from 'next/navigation'

import type { Project, Team } from '@/types'
import { NavMain } from '@/components/nav-main'
import { NavProjects } from '@/components/nav-projects'
import { NavUser } from '@/components/nav-user'
import { TeamSwitcher } from '@/components/team-switcher'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from '@/components/ui/sidebar'

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
    teamId: string
    teamName: string
    teams: Team[]
    projects: Project[]
    user: {
        name: string
        email: string
        image?: string | null
    }
}

export function AppSidebar({
    teamId,
    teamName,
    teams,
    projects,
    user,
    ...props
}: AppSidebarProps) {
    const pathname = usePathname()
    const navMain = [
        {
            title: 'Kanban',
            url: `/t/${teamId}`,
            icon: FolderKanban,
            isActive: pathname === `/t/${teamId}`,
        },
        {
            title: 'Views',
            url: `/t/${teamId}/views`,
            icon: LayoutGrid,
            isActive: pathname.startsWith(`/t/${teamId}/views`),
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
    const projectItems = projects.map(project => ({
        name: project.name,
        url: `/t/${teamId}/p/${project.id}`,
        icon: Shapes,
    }))
    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <TeamSwitcher
                    teams={teams}
                    activeTeamId={teamId}
                    teamName={teamName} />
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={navMain} />
                {projectItems.length > 0 && (
                    <NavProjects projects={projectItems} />
                )}
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
