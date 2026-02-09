import { useWireValue } from '@forminator/react-wire'
import { getUnixTime } from 'date-fns'
import { memo, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { signOut, useSession } from '@/lib/auth-client'
import { teams as storeTeams } from '@/store/teams'

const avatarUrlFor = (name: string, email: string) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}`

const UserAccountMenu = () => {
    const { data: session } = useSession()
    const location = useLocation()
    const navigate = useNavigate()
    const pathname = location.pathname
    
    const teams = useWireValue(storeTeams)
    
    const { user, name, avatarUrl } = useMemo(() => {
        const user = session?.user
        const name = session?.user?.name || session?.user?.email || 'User'
        const email = session?.user?.email || ''
        const avatarUrl = avatarUrlFor(name, email)
        
        return { user, name, email, avatarUrl }
    }, [session])
    
    const activeTeamId = useMemo(() => {
        const match = pathname?.match(/\/t\/([^/]+)/)
        return match?.[1] ?? teams.sort((a, b) => getUnixTime(a.updatedAt) - getUnixTime(b.updatedAt))[0].id
    }, [pathname])
    
    const onSignOutClick = () => {
        signOut()
        window.location.replace('/')
    }
    
    const onTeamSelect = (teamId: string) => {
        navigate(`/t/${teamId}`)
    }
    
    const onSettingsClick = () => {
        navigate(`/t/${activeTeamId}/settings`)
    }
    
    return (
        <div className="p-4 border-t border-neutral-700">
            <DropdownMenu>
                <DropdownMenuTrigger
                    render={(
                        <Button
                            className="w-full p-0 h-auto justify-start hover:bg-neutral-700"
                            variant="ghost" />
                    )}>
                    <div className="flex items-center gap-3 px-3 py-2">
                        <img src={user?.image || avatarUrl} alt={name} className="w-8 h-8 rounded-full" />
                        <span className="text-neutral-100">{name}</span>
                    </div>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuGroup>
                        <DropdownMenuLabel>Teams</DropdownMenuLabel>
                        {teams.map(team => (
                            <DropdownMenuItem
                                key={team.id}
                                onClick={() => onTeamSelect(team.id)}
                                className={team.id === activeTeamId ? 'font-medium' : undefined}>
                                <span>{team.name}</span>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onSettingsClick}>
                        <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onSignOutClick}>
                        <span>Logout</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}

export default memo(UserAccountMenu)
