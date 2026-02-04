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

const PrimarySidebar = ({ teamId }: { teamId: string }) => {
    const pathname = usePathname()

    const navItems = [
        { icon: Search, label: 'Search', href: `/t/${teamId}/search` },
        { icon: Users, label: 'Teams', href: `/t/${teamId}/teams` },
        { icon: Eye, label: 'Views', href: `/t/${teamId}/views` },
        { icon: Eye, label: 'Views', href: `/t/${teamId}/views-2` },
        { icon: Code, label: 'Engineering', href: `/t/${teamId}/engineering` },
        { icon: Palette, label: 'Design', href: `/t/${teamId}/design` },
        { icon: TrendingUp, label: 'Marketing', href: `/t/${teamId}/marketing` },
        { icon: Settings, label: 'Settings', href: `/t/${teamId}/settings` },
        { icon: LayoutGrid, label: 'Kanban', href: `/t/${teamId}`, active: true },
    ]

    return (
        <div className="w-[240px] h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-sidebar-border">
                <button
                    type="button"
                    className="flex items-center gap-2 w-full text-left hover:bg-sidebar-accent rounded-lg p-2 transition-colors"
                >
                    <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                        <span className="text-xs font-bold text-primary-foreground">A</span>
                    </div>
                    <span className="text-sm font-medium text-sidebar-foreground">Acme Projects</span>
                    <svg
                        className="w-4 h-4 ml-auto text-muted-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>

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
