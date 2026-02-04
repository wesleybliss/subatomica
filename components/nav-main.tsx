'use client'

import type { LucideIcon } from 'lucide-react'

import {
    SidebarGroup,
    SidebarGroupLabel,
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

export function NavMain({ items }: { items: NavItem[] }) {
    return (
        <SidebarGroup>
            <SidebarMenu>
                {items.map(item => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            className="px-4 py-4"
                            asChild
                            isActive={item.isActive}
                            tooltip={item.title}>
                            <a href={item.url}>
                                {item.icon && <item.icon />}
                                <span className="group-data-[state=collapsed]/sidebar:hidden">
                                    {item.title}
                                </span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    )
}
