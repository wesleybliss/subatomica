import { Link } from 'react-router-dom'
import { Link } from 'react-router-dom'
import {
    PanelLeftClose,
    PanelLeftOpen,
} from 'lucide-react'
import TeamsAccountMenu from '@/components/PrimarySidebar/TeamsAccountMenu'
import { Button } from '@/components/ui/button'
import PrimarySidebarViewModel from './PrimarySidebarViewModel'

// @todo @deprecated - don't delete yet, might merge some things into the AppSidebar
const PrimarySidebar = ({ teamId }: { teamId: string }) => {
    const {
        isCollapsed,
        navItems,
        sidebarClassName,
        navClassName,
        collapseButtonClassName,
        getNavItemClassName,
        toggleCollapse,
        isNavItemActive,
    } = PrimarySidebarViewModel({ teamId })
    
    return (
        <div className={sidebarClassName}>
            <TeamsAccountMenu collapsed={isCollapsed} />
            <nav className={navClassName}>
                <div className="space-y-1">
                    {navItems.map((item, index) => {
                        const Icon = item.icon
                        const isActive = isNavItemActive(item)
                        return (
                            <Link
                                key={`${item.label}-${index}`}
                                href={item.href}
                                title={isCollapsed ? item.label : undefined}
                                className={getNavItemClassName(isActive)}>
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
                    className={collapseButtonClassName}
                    onClick={toggleCollapse}>
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
