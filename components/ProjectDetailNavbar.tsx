'use client'
import { useRouter } from 'next/navigation'
import type { Project } from '@/types'
import { ChevronDown, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SidebarTrigger } from '@/components/ui/sidebar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuPortal,
    DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ProjectDetailNavbarProps {
    teamId: string
    projects: Project[]
    selectedProjectId: string
}

const ProjectDetailNavbar = ({
    teamId,
    projects,
    selectedProjectId,
}: ProjectDetailNavbarProps) => {
    
    const router = useRouter()
    
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
                                <span className="text-sm">
                                    {projects?.find(it => it.id === selectedProjectId)?.name}
                                </span>
                                <ChevronDown size="16px" />
                            </Button>
                        )} />
                        <DropdownMenuContent className="w-40" align="start">
                            <DropdownMenuGroup>
                                <DropdownMenuLabel>Starred</DropdownMenuLabel>
                                <DropdownMenuItem disabled>No starred projects.</DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel>Projects</DropdownMenuLabel>
                                {projects?.map(it => it.id !== selectedProjectId ? (
                                    <DropdownMenuItem
                                        key={`projects-menu-${it.id}`}
                                        className="flex justify-between items-center gap-2"
                                        onClick={() => router.push(`/t/${teamId}/p/${it.id}`)}>
                                        <span>{it.name}</span>
                                        {it.id === selectedProjectId && (
                                            <span className="block size-2 rounded-full bg-green-700/40" />
                                        )}
                                    </DropdownMenuItem>
                                ) : (
                                    <DropdownMenuSub key={`projects-menu-${it.id}`}>
                                        <DropdownMenuSubTrigger>
                                            <div className="w-full flex-1 flex justify-between items-center gap-2">
                                                <span>{it.name}</span>
                                                {it.id === selectedProjectId && (
                                                    <span className="block size-2 rounded-full bg-green-700/40" />
                                                )}
                                            </div>
                                        </DropdownMenuSubTrigger>
                                        <DropdownMenuPortal>
                                            <DropdownMenuSubContent>
                                                <DropdownMenuGroup>
                                                    <DropdownMenuItem
                                                        onClick={() => console.log('@todo rename project', it)}>
                                                        <Pencil className="text-muted-foreground" />
                                                        <span>Rename</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuGroup>
                                                <DropdownMenuGroup>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => console.log('@todo delete project')}>
                                                        <Trash2 className="text-destructive-foreground" />
                                                        <span>Delete</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuGroup>
                                            </DropdownMenuSubContent>
                                        </DropdownMenuPortal>
                                    </DropdownMenuSub>
                                ))}
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
        
    )
    
}

export default ProjectDetailNavbar
