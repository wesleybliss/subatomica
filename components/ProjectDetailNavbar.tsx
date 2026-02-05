'use client'
import { useRouter } from 'next/navigation'
import type { Project } from '@/types'
import { ChevronDown, FolderKanban } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SidebarTrigger } from '@/components/ui/sidebar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ThemeToggle from '@/components/ThemeToggle'

interface ProjectDetailNavbarProps {
    teamId: string
    project: Project
    projects?: Project[]
    activeView: 'kanban' | 'timeline'
    onViewChange: (view: 'kanban' | 'timeline') => void
}

const ProjectDetailNavbar = ({
    teamId,
    project,
    projects = [],
    activeView,
    onViewChange,
}: ProjectDetailNavbarProps) => {
    const router = useRouter()
    const otherProjects = projects.filter(p => p.id !== project.id)
    
    return (
        <header className="flex items-center justify-between border-b border-border px-6 py-4">
            <div className="flex items-center gap-3">
                <SidebarTrigger className="-ml-1" />
                <div className="flex flex-col gap-1">
                    <DropdownMenu>
                        <DropdownMenuTrigger render={(
                            <Button
                                className="flex justify-between items-center gap-2 opacity-70 hover:opacity-100"
                                variant="ghost">
                                <span className="text-sm font-medium">
                                    {project.name}
                                </span>
                                <ChevronDown size="16px" />
                            </Button>
                        )} />
                        <DropdownMenuContent className="w-56" align="start">
                            <DropdownMenuGroup>
                                <DropdownMenuLabel>Projects</DropdownMenuLabel>
                                {otherProjects.length > 0 ? (
                                    otherProjects.map(p => (
                                        <DropdownMenuItem
                                            key={`projects-menu-${p.id}`}
                                            className="flex justify-between items-center gap-2"
                                            onClick={() => router.push(`/t/${teamId}/p/${p.id}`)}>
                                            <span className="truncate">{p.name}</span>
                                        </DropdownMenuItem>
                                    ))
                                ) : (
                                    <DropdownMenuItem disabled>
                                        No other projects
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuItem
                                    onClick={() => router.push(`/t/${teamId}/p`)}>
                                    <FolderKanban className="mr-2 h-4 w-4" />
                                    View all projects
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            
            <Tabs
                value={activeView}
                onValueChange={value => onViewChange(value as 'kanban' | 'timeline')}
                className="w-auto">
                <TabsList>
                    <TabsTrigger value="kanban">Kanban</TabsTrigger>
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                </TabsList>
            </Tabs>
            <ThemeToggle />
        </header>
    )
}

export default ProjectDetailNavbar
