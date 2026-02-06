'use client'

import * as React from 'react'
import { ChevronsUpDown, Plus, SquareTerminal } from 'lucide-react'
import { useRouter } from 'next/navigation'

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarMenu, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar'
import type { Team } from '@repo/shared/types'

type TeamSwitcherProps = {
    teams: Team[]
    activeTeamId: string
    teamName: string
}

export function TeamSwitcher({ teams, activeTeamId, teamName }: TeamSwitcherProps) {
    const { isMobile } = useSidebar()
    const router = useRouter()
    const [activeTeam, setActiveTeam] = React.useState<Team | null>(null)
    React.useEffect(() => {
        const nextActiveTeam = teams.find(team => team.id === activeTeamId)
        setActiveTeam(nextActiveTeam ?? teams[0] ?? null)
    }, [activeTeamId, teams])
    
    const activeTeamName = activeTeam?.name ?? 'Personal'
    const activeTeamInitial = activeTeamName.slice(0, 1).toUpperCase()
    
    if (!activeTeam) return null
    return (
        <SidebarMenu className="w-full">
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger
                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground
                            flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm">
                        <div
                            className="bg-sidebar-primary text-sidebar-primary-foreground
                                flex aspect-square size-7 items-center justify-center rounded-lg
                                group-data-[state=collapsed]/sidebar:size-9">
                            <div className="size-7 bg-primary rounded flex items-center justify-center
                                group-data-[state=collapsed]/sidebar:size-9">
                                <span className="text-xs font-bold text-primary-foreground
                                    group-data-[state=collapsed]/sidebar:text-sm">
                                    {activeTeamInitial}
                                </span>
                            </div>
                        </div>
                        <div
                            className="group-data-[state=collapsed]/sidebar:hidden grid flex-1
                                text-left text-sm leading-tight">
                            <span className="truncate font-medium">
                                {teamName}
                            </span>
                        </div>
                        <ChevronsUpDown
                            className="ml-auto group-data-[state=collapsed]/sidebar:hidden size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        align="start"
                        side={isMobile ? 'bottom' : 'right'}
                        sideOffset={4}>
                        <DropdownMenuGroup>
                            <DropdownMenuLabel className="text-muted-foreground text-xs">
                                Teams
                            </DropdownMenuLabel>
                        </DropdownMenuGroup>
                        {teams.map((team, index) => (
                            <DropdownMenuItem
                                key={team.id}
                                onClick={() => {
                                    setActiveTeam(team)
                                    router.push(`/t/${team.id}`)
                                }}
                                className="gap-2 p-2">
                                <div className="flex size-6 items-center justify-center rounded-md border">
                                    <SquareTerminal className="size-3.5 shrink-0" />
                                </div>
                                {team.name}
                                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2 p-2">
                            <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                                <Plus className="size-4" />
                            </div>
                            <div className="text-muted-foreground font-medium">Add team</div>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
