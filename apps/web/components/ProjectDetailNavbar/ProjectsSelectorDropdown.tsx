'use client'
import type { Project } from '@repo/shared/types'
import { useRouter } from 'next/navigation'
import { ChevronDown, FolderKanban, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
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

interface ProjectsSelectorDropdownProps {
    teamId: string
    projects: Project[]
    selectedProjectId: string
}

const ProjectsSelectorDropdown = ({
    teamId,
    projects,
    selectedProjectId,
}: ProjectsSelectorDropdownProps) => {
    
    const router = useRouter()
    
    return (
        
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
        
    )
    
}

export default ProjectsSelectorDropdown
