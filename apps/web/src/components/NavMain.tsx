import { Link } from 'react-router-dom'

import type { LucideIcon } from 'lucide-react'

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
                        <Link to={item.url}>
                            
                            <SidebarMenuButton
                                className="px-3 py-6"
                                isActive={item.isActive}
                                tooltip={item.title}>
                                
                                {item.icon && <item.icon className="size-4!" />}
                                
                                <span className="group-data-[state=collapsed]/sidebar:hidden">
                                    {item.title}
                                </span>
                            
                            </SidebarMenuButton>
                        
                        </Link>
                    </SidebarMenuItem>
                ))}
            
            </SidebarMenu>
        </SidebarGroup>
        
    )
    
}
