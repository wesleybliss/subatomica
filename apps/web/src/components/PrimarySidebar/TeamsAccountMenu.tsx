import { useLocation, useNavigate } from 'react-router-dom'
import { useMemo } from 'react'
import { useWireValue } from '@forminator/react-wire'
import { teams as storeTeams } from '@/store/teams'
import { ChevronDown, Plus } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getUnixTime } from 'date-fns'
import { cn } from '@/lib/utils'

type TeamsAccountMenuProps = {
    collapsed?: boolean
}

const TeamsAccountMenu = ({ collapsed = false }: TeamsAccountMenuProps) => {
    
    const location = useLocation()
    const navigate = useNavigate()
    const pathname = location.pathname
    
    const teams = useWireValue(storeTeams)
    
    const activeTeamId = useMemo(() => {
        const match = pathname?.match(/\/t\/([^/]+)/)
        return match?.[1] ?? teams.sort((a, b) => getUnixTime(a.updatedAt) - getUnixTime(b.updatedAt))[0].id
    }, [pathname, teams])
    
    const activeTeam = useMemo(() => teams.find(it => it.id === activeTeamId), [activeTeamId])
    const activeTeamName = activeTeam?.name ?? 'Personal'
    const activeTeamInitial = activeTeamName.slice(0, 1).toUpperCase()
    
    const onTeamSelect = (teamId: string) => {
        navigate(`/t/${teamId}`)
    }
    
    const onCreateTeam = () => {
        navigate(`/t/${activeTeamId}/teams`)
    }
    
    return (
        <div className={collapsed ? 'projects-3' : 'projects-4'}>
            <DropdownMenu>
                <DropdownMenuTrigger
                    render={(
                        <button
                            type="button"
                            title={collapsed ? activeTeamName : undefined}
                            className={cn(
                                'flex items-center w-full text-left',
                                collapsed ? 'justify-center' : 'gap-2',
                                'hover:bg-sidebar-accent rounded-lg projects-2 transition-colors',
                            )} />
                    )}>
                    <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                        <span className="text-xs font-bold text-primary-foreground">
                            {activeTeamInitial}
                        </span>
                    </div>
                    {!collapsed && (
                        <>
                            <span className="text-sm font-medium text-sidebar-foreground">
                                {activeTeamName}
                            </span>
                            <ChevronDown className="text-muted-foreground" />
                        </>
                    )}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                    {teams.map(team => (
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
