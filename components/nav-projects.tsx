'use client'

import {
    Folder,
    Forward,
    MoreHorizontal,
    Trash2,
    type LucideIcon,
} from 'lucide-react'

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar'

type ProjectItem = {
    name: string
    url: string
    icon: LucideIcon
}

export function NavProjects({ projects }: { projects: ProjectItem[] }) {
    const { isMobile } = useSidebar()
    return (
        <SidebarGroup className="group-data-[state=collapsed]/sidebar:hidden">
            <SidebarGroupLabel>Projects</SidebarGroupLabel>
            <SidebarMenu>
                {projects.map(item => (
                    <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton asChild>
                            <a href={item.url}>
                                <item.icon />
                                <span>{item.name}</span>
                            </a>
                        </SidebarMenuButton>
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                className={[
                                    'text-sidebar-foreground/60 hover:text-sidebar-foreground',
                                    'ml-auto inline-flex size-7 items-center justify-center rounded-md',
                                    'opacity-0 transition-opacity group-hover/sidebar-menu-item:opacity-100',
                                ].join(' ')}>
                                <MoreHorizontal />
                                <span className="sr-only">More</span>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-48 rounded-lg"
                                side={isMobile ? 'bottom' : 'right'}
                                align={isMobile ? 'end' : 'start'}>
                                <DropdownMenuItem>
                                    <Folder className="text-muted-foreground" />
                                    <span>View Project</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Forward className="text-muted-foreground" />
                                    <span>Share Project</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <Trash2 className="text-muted-foreground" />
                                    <span>Delete Project</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    )
}
