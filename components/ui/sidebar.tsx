'use client'

import * as React from 'react'
import { PanelLeft } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Slot } from '@/components/ui/slot'

type SidebarContextValue = {
    open: boolean
    setOpen: (open: boolean) => void
    isMobile: boolean
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null)

function useSidebar() {
    const context = React.useContext(SidebarContext)
    if (!context)
        throw new Error('useSidebar must be used within SidebarProvider')
    return context
}

interface SidebarProviderProps extends React.HTMLAttributes<HTMLDivElement> {
    defaultOpen?: boolean
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

function SidebarProvider({
    defaultOpen = true,
    open: openProp,
    onOpenChange,
    className,
    ...props
}: SidebarProviderProps) {
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
    const open = openProp ?? uncontrolledOpen
    const [isMobile, setIsMobile] = React.useState(false)

    React.useEffect(() => {
        const mediaQuery = window.matchMedia('(max-width: 768px)')
        const update = () => setIsMobile(mediaQuery.matches)
        update()
        mediaQuery.addEventListener('change', update)
        return () => mediaQuery.removeEventListener('change', update)
    }, [])

    const setOpen = React.useCallback(
        (nextOpen: boolean) => {
            if (openProp === undefined) setUncontrolledOpen(nextOpen)
            onOpenChange?.(nextOpen)
        },
        [openProp, onOpenChange],
    )

    return (
        <SidebarContext.Provider value={{ open, setOpen, isMobile }}>
            <div
                className={cn('group/sidebar-wrapper flex h-svh w-full', className)}
                {...props}/>
        </SidebarContext.Provider>
    )
}

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    collapsible?: 'icon' | 'none'
}

function Sidebar({
    collapsible = 'icon',
    className,
    ...props
}: SidebarProps) {
    const { open } = useSidebar()
    const isCollapsed = collapsible === 'icon' && !open

    return (
        <aside
            data-collapsible={collapsible}
            data-state={isCollapsed ? 'collapsed' : 'expanded'}
            className={cn(
                'group/sidebar bg-sidebar text-sidebar-foreground border-sidebar-border flex h-svh flex-col border-r transition-[width] duration-200 ease-linear',
                isCollapsed ? 'w-16' : 'w-64',
                className,
            )}
            {...props}/>
    )
}

function SidebarInset({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            data-sidebar-inset
            className={cn('min-w-0 flex-1', className)}
            {...props}/>
    )
}

function SidebarTrigger({
    className,
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    const { open, setOpen } = useSidebar()

    return (
        <button
            type="button"
            aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'}
            className={cn(
                'border-border text-foreground hover:bg-muted inline-flex size-8 items-center justify-center rounded-md border bg-background transition-colors',
                className,
            )}
            onClick={() => setOpen(!open)}
            {...props}>
            <PanelLeft className={cn('size-4 transition-transform', !open && 'rotate-180')} />
        </button>
    )
}

function SidebarRail({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            aria-hidden="true"
            className={cn('bg-sidebar-border h-px w-full', className)}
            {...props}/>
    )
}

function SidebarHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn('flex items-center gap-2 p-3', className)}
            {...props}/>
    )
}

function SidebarContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn('flex-1 overflow-y-auto px-2 pb-2', className)}
            {...props}/>
    )
}

function SidebarFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn('border-sidebar-border border-t p-3', className)}
            {...props}/>
    )
}

function SidebarGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn('mt-2 space-y-1', className)}
            {...props}/>
    )
}

function SidebarGroupLabel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn('text-muted-foreground px-2 text-xs uppercase tracking-wide', className)}
            {...props}/>
    )
}

function SidebarMenu({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) {
    return (
        <ul
            className={cn('flex flex-col gap-1', className)}
            {...props}/>
    )
}

function SidebarMenuItem({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) {
    return (
        <li
            className={cn('group/sidebar-menu-item relative', className)}
            {...props}/>
    )
}

interface SidebarMenuButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean
    tooltip?: string
    isActive?: boolean
}

function SidebarMenuButton({
    asChild,
    tooltip,
    isActive,
    className,
    ...props
}: SidebarMenuButtonProps) {
    const Component = asChild ? Slot : 'button'

    return (
        <Component
            type={asChild ? undefined : 'button'}
            data-active={isActive ? 'true' : 'false'}
            title={tooltip}
            className={cn(
                'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors group-data-[state=collapsed]/sidebar:justify-center',
                className,
            )}
            {...props}/>
    )
}

interface SidebarMenuActionProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    showOnHover?: boolean
}

function SidebarMenuAction({
    showOnHover,
    className,
    ...props
}: SidebarMenuActionProps) {
    return (
        <button
            type="button"
            data-show-on-hover={showOnHover ? 'true' : 'false'}
            className={cn(
                'text-sidebar-foreground/60 hover:text-sidebar-foreground ml-auto inline-flex size-7 items-center justify-center rounded-md transition-opacity data-[show-on-hover=true]:opacity-0 group-hover/sidebar-menu-item:opacity-100',
                className,
            )}
            {...props}/>
    )
}

function SidebarMenuSub({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) {
    return (
        <ul
            className={cn('border-sidebar-border ml-3 mt-1 flex flex-col gap-1 border-l pl-3', className)}
            {...props}/>
    )
}

function SidebarMenuSubItem({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) {
    return (
        <li
            className={cn('relative', className)}
            {...props}/>
    )
}

interface SidebarMenuSubButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean
}

function SidebarMenuSubButton({
    asChild,
    className,
    ...props
}: SidebarMenuSubButtonProps) {
    const Component = asChild ? Slot : 'button'

    return (
        <Component
            type={asChild ? undefined : 'button'}
            className={cn(
                'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent flex w-full items-center gap-2 rounded-md px-2 py-1 text-xs transition-colors',
                className,
            )}
            {...props}/>
    )
}

export {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarProvider,
    SidebarRail,
    SidebarTrigger,
    useSidebar,
}
