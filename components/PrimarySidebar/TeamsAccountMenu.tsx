'use client'

import { useMemo } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { ChevronDown, Plus } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getDefaultTeamId, getTeamById, mockTeams } from '@/lib/constants'

const TeamsAccountMenu = () => {
    const pathname = usePathname()
    const router = useRouter()
    
    const activeTeamId = useMemo(() => {
        const match = pathname?.match(/\/t\/([^/]+)/)
        return match?.[1] ?? getDefaultTeamId()
    }, [pathname])
    
    const activeTeam = useMemo(() => getTeamById(activeTeamId), [activeTeamId])
    const activeTeamName = activeTeam?.name ?? 'Personal'
    const activeTeamInitial = activeTeamName.slice(0, 1).toUpperCase()
    
    const onTeamSelect = (teamId: string) => {
        router.push(`/t/${teamId}`)
    }
    
    const onCreateTeam = () => {
        router.push(`/t/${activeTeamId}/teams`)
    }
    
    return (
        <div className="p-4">
            <DropdownMenu>
                <DropdownMenuTrigger
                    render={(
                        <button
                            type="button"
                            className={[
                                'flex items-center gap-2 w-full text-left',
                                'hover:bg-sidebar-accent rounded-lg p-2 transition-colors',
                            ].join(' ')} />
                    )}>
                    <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                        <span className="text-xs font-bold text-primary-foreground">
                            {activeTeamInitial}
                        </span>
                    </div>
                    <span className="text-sm font-medium text-sidebar-foreground">
                        {activeTeamName}
                    </span>
                    <ChevronDown size={18} className="text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                    {mockTeams.map(team => (
                        <DropdownMenuItem
                            key={team.id}
                            onClick={() => onTeamSelect(team.id)}
                            className={team.id === activeTeamId ? 'font-medium' : undefined}>
                            <span>{team.name}</span>
                        </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onCreateTeam}>
                        <Plus className="size-4" />
                        <span>Create team</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}

export default TeamsAccountMenu
