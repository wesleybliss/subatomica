'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    Search,
    Users,
    Eye,
    FolderKanban,
    Code,
    Palette,
    TrendingUp,
    Settings,
    LayoutGrid,
} from 'lucide-react'
import TeamsAccountMenu from '@/components/PrimarySidebar/TeamsAccountMenu'

const PrimarySidebar = ({ teamId }: { teamId: string }) => {
    const pathname = usePathname()

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
        <div className="w-60 h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
            {/* Header */}
            <TeamsAccountMenu />

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-3">
                <div className="space-y-1">
                    {navItems.map((item, index) => {
                        const Icon = item.icon
                        const isActive = item.active || pathname === item.href
                        return (
                            <Link
                                key={`${item.label}-${index}`}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                                    isActive
                                        ? 'bg-sidebar-accent text-sidebar-foreground font-medium'
                                        : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground'
                                }`}
                            >
                                <Icon className="w-4 h-4 shrink-0" />
                                <span>{item.label}</span>
                            </Link>
                        )
                    })}
                </div>
            </nav>
        </div>
    )
}

export default PrimarySidebar
