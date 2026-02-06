'use client'

import { useRouter } from 'next/navigation'
import type { Project } from '@/types'
import { ChevronDown, FolderKanban, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SidebarTrigger } from '@/components/ui/sidebar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ThemeToggle from '@/components/ThemeToggle'

interface ProjectDetailNavbarProps {
    teamId: string
    projects: Project[]
    selectedProjectId: string
    activeView: 'kanban' | 'timeline' | 'list'
    onViewChange: (view: 'kanban' | 'timeline' | 'list') => void
}

const ProjectDetailNavbar = ({
    teamId,
    projects,
    selectedProjectId,
    activeView,
    onViewChange,
}: ProjectDetailNavbarProps) => {
    const router = useRouter()
    
    return (
        <header className="flex items-center justify-between border-b border-border px-6 py-3">
            <div className="flex items-center gap-3">
                <SidebarTrigger className="-ml-1" />
                <div className="flex flex-col gap-1">
                    <DropdownMenu>
                        <DropdownMenuTrigger render={(
                            <Button
                                className="flex justify-between items-center gap-2 opacity-70 hover:opacity-100"
                                variant="ghost">
                                <span className="text-sm">
                                    {projects?.find(it => it.id === selectedProjectId)?.name}
                                </span>
                                <ChevronDown size="16px" />
                            </Button>
                        )} />
                        <DropdownMenuContent className="w-56" align="start">
                            <DropdownMenuGroup>
                                <DropdownMenuLabel>Starred</DropdownMenuLabel>
                                <DropdownMenuItem disabled>No starred projects.</DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuLabel>Projects</DropdownMenuLabel>
                                {projects?.map(it => it.id !== selectedProjectId ? (
                                    <DropdownMenuItem
                                        key={`projects-menu-${it.id}`}
                                        className="flex justify-between items-center gap-2"
                                        onClick={() => router.push(`/t/${teamId}/p/${it.id}`)}>
                                        <span>{it.name}</span>
                                    </DropdownMenuItem>
                                ) : (
                                    <DropdownMenuSub key={`projects-menu-${it.id}`}>
                                        <DropdownMenuSubTrigger>
                                            <div className="w-full flex-1 flex justify-between items-center gap-2">
                                                <span>{it.name}</span>
                                                <span className="block size-2 rounded-full bg-green-700/40" />
                                            </div>
                                        </DropdownMenuSubTrigger>
                                        <DropdownMenuPortal>
                                            <DropdownMenuSubContent>
                                                <DropdownMenuGroup>
                                                    <DropdownMenuItem
                                                        onClick={() => console.log('@todo rename project', it)}>
                                                        <Pencil className="text-muted-foreground mr-2 h-4 w-4" />
                                                        <span>Rename</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuGroup>
                                                <DropdownMenuGroup>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => console.log('@todo delete project')}>
                                                        <Trash2 className="text-destructive mr-2 h-4 w-4" />
                                                        <span>Delete</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuGroup>
                                            </DropdownMenuSubContent>
                                        </DropdownMenuPortal>
                                    </DropdownMenuSub>
                                ))}
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
                onValueChange={value => onViewChange(value as 'kanban' | 'timeline' | 'list')}
                className="w-auto">
                <TabsList>
                    <TabsTrigger value="list">List</TabsTrigger>
                    <TabsTrigger value="kanban">Kanban</TabsTrigger>
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                </TabsList>
            </Tabs>
            <ThemeToggle />
        </header>
    )
}

export default ProjectDetailNavbar
