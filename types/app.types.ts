import type { ComponentType } from 'react'

export interface SidebarItem {
    id: string
    label: string
    icon: ComponentType<{ className?: string }>
    href: string
    count?: number
}

export interface SidebarGroup {
    id: string
    label: string
    icon: ComponentType<{ className?: string }>
    items?: SidebarItem[]
    collapsed?: boolean
    href?: string
}
