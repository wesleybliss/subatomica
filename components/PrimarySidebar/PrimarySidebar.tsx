'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    Search,
    Users,
    Eye,
    /*FolderKanban,*/
    Code,
    Palette,
    TrendingUp,
    Settings,
    LayoutGrid,
    PanelLeftClose,
    PanelLeftOpen,
} from 'lucide-react'
import TeamsAccountMenu from '@/components/PrimarySidebar/TeamsAccountMenu'
import { Button } from '@/components/ui/button'

// @todo @deprecated - don't delete yet, might merge some things into the AppSidebar
const PrimarySidebar = ({ teamId }: { teamId: string }) => {
    const pathname = usePathname()
    const [isCollapsed, setIsCollapsed] = useState(false)
    const sidebarClassName = [
        'h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-[width] duration-200',
        isCollapsed ? 'w-16' : 'w-60',
    ].join(' ')
    
    const navItems = [
        { icon: Search, label: 'Search', href: `/t/${teamId}/search` },
        { icon: Users, label: 'Teams', href: `/t/${teamId}/teams` },
        { icon: Eye, label: 'Views', href: `/t/${teamId}/views` },
        { icon: Code, label: 'Engineering', href: `/t/${teamId}/engineering` },
        { icon: Palette, label: 'Design', href: `/t/${teamId}/design` },
        { icon: TrendingUp, label: 'Marketing', href: `/t/${teamId}/marketing` },
        { icon: Settings, label: 'Settings', href: `/t/${teamId}/settings` },
        { icon: LayoutGrid, label: 'Kanban', href: `/t/${teamId}`, active: true },
    ]
    
    return (
        <div className={sidebarClassName}>
            <TeamsAccountMenu collapsed={isCollapsed} />
            <nav className={`flex-1 overflow-y-auto ${isCollapsed ? 'px-2' : 'p-3'}`}>
                <div className="space-y-1">
                    {navItems.map((item, index) => {
                        const Icon = item.icon
                        const isActive = item.active || pathname === item.href
                        return (
                            <Link
                                key={`${item.label}-${index}`}
                                href={item.href}
                                title={isCollapsed ? item.label : undefined}
                                className={`flex items-center gap-3 rounded-lg text-sm transition-colors ${
                                    isCollapsed ? 'justify-center px-2 py-2' : 'px-3 py-2'
                                } ${
                                    isActive
                                        ? 'bg-sidebar-accent text-sidebar-foreground font-medium'
                                        : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground'
                                }`}>
                                <Icon className="w-4 h-4 shrink-0" />
                                {!isCollapsed && <span>{item.label}</span>}
                            </Link>
                        )
                    })}
                </div>
            </nav>
            <div className="border-t border-sidebar-border p-3">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={`w-full ${isCollapsed ? 'justify-center px-2' : 'justify-start'}`}
                    onClick={() => setIsCollapsed(current => !current)}>
                    {isCollapsed ? (
                        <PanelLeftOpen className="h-4 w-4" />
                    ) : (
                        <PanelLeftClose className="h-4 w-4" />
                    )}
                    {!isCollapsed && <span className="ml-2">Collapse</span>}
                </Button>
            </div>
        </div>
    )
}

export default PrimarySidebar
