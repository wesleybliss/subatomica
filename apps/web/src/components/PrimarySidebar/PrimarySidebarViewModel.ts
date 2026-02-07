import { Link } from 'react-router-dom'
import { usePathname } from 'next/navigation'
import { useWireValue } from '@forminator/react-wire'
import {
    Search,
    Users,
    Eye,
    Code,
    Palette,
    TrendingUp,
    Settings,
    LayoutGrid,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { primarySidebarCollapsed } from '@/store/app'
import type { LucideIcon } from 'lucide-react'

type NavItem = {
    icon: LucideIcon
    label: string
    href: string
    active?: boolean
}

type PrimarySidebarViewModelInput = {
    teamId: string
}

const PrimarySidebarViewModel = ({ teamId }: PrimarySidebarViewModelInput) => {
    const pathname = usePathname()
    const isCollapsed = useWireValue(primarySidebarCollapsed)
    
    const sidebarClassName = cn(
        'h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-[width] duration-200',
        isCollapsed ? 'w-16' : 'w-60',
    )
    
    const navClassName = cn(
        'flex-1 overflow-y-auto',
        isCollapsed ? 'px-2' : 'p-3',
    )
    
    const collapseButtonClassName = cn(
        'w-full',
        isCollapsed ? 'justify-center px-2' : 'justify-start',
    )
    
    const getNavItemClassName = (isActive: boolean) => cn(
        'flex items-center gap-3 rounded-lg text-sm transition-colors',
        isCollapsed ? 'justify-center px-2 py-2' : 'px-3 py-2',
        isActive
            ? 'bg-sidebar-accent text-sidebar-foreground font-medium'
            : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground',
    )
    
    const navItems: NavItem[] = [
        { icon: Search, label: 'Search', href: `/t/${teamId}/search` },
        { icon: Users, label: 'Teams', href: `/t/${teamId}/teams` },
        { icon: Eye, label: 'Views', href: `/t/${teamId}/views` },
        { icon: Code, label: 'Engineering', href: `/t/${teamId}/engineering` },
        { icon: Palette, label: 'Design', href: `/t/${teamId}/design` },
        { icon: TrendingUp, label: 'Marketing', href: `/t/${teamId}/marketing` },
        { icon: Settings, label: 'Settings', href: `/t/${teamId}/settings` },
        { icon: LayoutGrid, label: 'Kanban', href: `/t/${teamId}`, active: true },
    ]
    
    const toggleCollapse = () => {
        primarySidebarCollapsed.setValue(!isCollapsed)
    }
    
    const isNavItemActive = (item: NavItem) => item.active || pathname === item.href
    
    return {
        // State
        isCollapsed,
        navItems,
        pathname,
        
        // Styles
        sidebarClassName,
        navClassName,
        collapseButtonClassName,
        
        // Methods
        getNavItemClassName,
        toggleCollapse,
        isNavItemActive,
    }
}

export default PrimarySidebarViewModel
