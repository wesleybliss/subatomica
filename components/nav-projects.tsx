'use client'

import {
    Folder,
    Forward,
    MoreHorizontal,
    Pencil,
    Trash2,
    type LucideIcon,
} from 'lucide-react'

import { useRouter } from 'next/navigation'

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
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar'

type ProjectItem = {
    id: string
    name: string
    url: string
    icon: LucideIcon
}

type NavProjectsProps = {
    projects: ProjectItem[]
    onRenameProject?: (projectId: string, name: string) => Promise<void>
}

// @todo @deprecated - save for now to re-use the rename functionality
export function NavProjects({ projects, onRenameProject }: NavProjectsProps) {
    const { isMobile } = useSidebar()
    const router = useRouter()
    const onRename = async (project: ProjectItem) => {
        if (!onRenameProject) return
        const nextName = window.prompt('Rename project', project.name)
        if (!nextName) return
        const trimmedName = nextName.trim()
        if (!trimmedName || trimmedName === project.name) return
        try {
            await onRenameProject(project.id, trimmedName)
            router.refresh()
        } catch (error) {
            console.error('Unable to rename project', error)
        }
    }
    return (
        <SidebarGroup className="group-data-[state=collapsed]/sidebar:hidden">
            <SidebarGroupLabel>Projects</SidebarGroupLabel>
            <SidebarMenu>
                {projects.map(item => (
                    <SidebarMenuItem key={item.id} className="flex items-center">
                        <SidebarMenuButton asChild className="flex-1">
                            <a href={item.url}>
                                <item.icon />
                                <span>{item.name}</span>
                            </a>
                        </SidebarMenuButton>
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                render={(
                                    <SidebarMenuAction showOnHover aria-label="Project options">
                                        <MoreHorizontal />
                                        <span className="sr-only">Project options</span>
                                    </SidebarMenuAction>
                                )} />
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
                                <DropdownMenuItem onClick={() => onRename(item)}>
                                    <Pencil className="text-muted-foreground" />
                                    <span>Rename Project</span>
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
