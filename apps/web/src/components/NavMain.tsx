import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

import {
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar'

type NavItem = {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
}

export function NavMain({
    items,
}: { items: NavItem[] }) {
    
    return (
        
        <SidebarGroup>
            <SidebarMenu>
                
                {items.map(item => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            render={<Link to={item.url} />}
                            isActive={item.isActive}
                            className="group-data-[collapsible=icon]:justify-center">
                            {item.icon && <item.icon />}
                            <span className="group-data-[collapsible=icon]:hidden">
                                {item.title}
                            </span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            
            </SidebarMenu>
        </SidebarGroup>
        
    )
    
}
