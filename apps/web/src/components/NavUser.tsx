import Logger from '@repo/shared/utils/logger'
import {
    BadgeCheck,
    Bell,
    ChevronsUpDown,
    CreditCard,
    LogOut,
    Sparkles,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@/components/ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar'
import { authClient } from '@/lib/auth-client'

const log = new Logger('web/components/NavUser')

type NavUserProps = {
    user: {
        name: string
        email: string
        image?: string | null
    }
}

const getInitials = (name: string) => name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('')

export function NavUser({ user }: NavUserProps) {
    const navigate = useNavigate()
    const { isMobile } = useSidebar()
    const initials = getInitials(user.name || 'User')
    
    const signOut = () => {
        authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    navigate('/sign-in', { replace: true })
                },
            },
        }).catch(e => {
            log.e('Failed to sign out', e)
            navigate('/sign-in', { replace: true })
        })
    }
    
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={
                            <SidebarMenuButton
                                size="lg"
                                className="data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground
                                    group-data-[collapsible=icon]:mx-auto
                                    group-data-[collapsible=icon]:justify-center" />
                        }>
                        <Avatar className="h-8 w-8 rounded-lg">
                            <AvatarImage src={user.image ?? undefined} alt={user.name} />
                            <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                        </Avatar>
                        <div
                            className="grid flex-1 text-left text-sm leading-tight
                                group-data-[collapsible=icon]:hidden">
                            <span className="truncate font-medium">{user.name}</span>
                            <span className="truncate text-xs">{user.email}</span>
                        </div>
                        <ChevronsUpDown
                            className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="min-w-56 rounded-lg"
                        side={isMobile ? 'bottom' : 'right'}
                        align="end"
                        sideOffset={4}>
                        <DropdownMenuGroup>
                            <DropdownMenuLabel className="p-0 font-normal">
                                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarImage src={user.image ?? undefined} alt={user.name} />
                                        <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-medium">{user.name}</span>
                                        <span className="truncate text-xs">{user.email}</span>
                                    </div>
                                </div>
                            </DropdownMenuLabel>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem>
                                <Sparkles className="size-4" />
                                Upgrade to Pro
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem onClick={() => navigate('/settings')}>
                                <BadgeCheck className="size-4" />
                                Account
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <CreditCard className="size-4" />
                                Billing
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Bell className="size-4" />
                                Notifications
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={signOut}>
                            <LogOut className="size-4" />
                            Sign out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
