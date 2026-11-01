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
                            size="lg"
                            isActive={item.isActive}
                            className="px-3 group-data-[collapsible=icon]:mx-auto
                                group-data-[collapsible=icon]:justify-center">
                            {item.icon && <item.icon className="size-5!" />}
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
