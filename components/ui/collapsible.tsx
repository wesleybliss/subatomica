'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'
import { Slot } from '@/components/ui/slot'

type CollapsibleContextValue = {
    open: boolean
    setOpen: (open: boolean) => void
}

const CollapsibleContext = React.createContext<CollapsibleContextValue | null>(null)

function useCollapsibleContext(component: string) {
    const context = React.useContext(CollapsibleContext)
    if (!context)
        throw new Error(`${component} must be used within Collapsible`)
    return context
}

interface CollapsibleProps extends React.HTMLAttributes<HTMLDivElement> {
    open?: boolean
    defaultOpen?: boolean
    onOpenChange?: (open: boolean) => void
    asChild?: boolean
}

function Collapsible({
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    asChild,
    className,
    ...props
}: CollapsibleProps) {
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
    const open = openProp ?? uncontrolledOpen

    const setOpen = React.useCallback(
        (nextOpen: boolean) => {
            if (openProp === undefined) setUncontrolledOpen(nextOpen)
            onOpenChange?.(nextOpen)
        },
        [openProp, onOpenChange],
    )

    const Component = asChild ? Slot : 'div'

    return (
        <CollapsibleContext.Provider value={{ open, setOpen }}>
            <Component
                data-state={open ? 'open' : 'closed'}
                className={cn(className)}
                {...props}/>
        </CollapsibleContext.Provider>
    )
}

interface CollapsibleTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean
}

function CollapsibleTrigger({
    asChild,
    className,
    onClick,
    ...props
}: CollapsibleTriggerProps) {
    const { open, setOpen } = useCollapsibleContext('CollapsibleTrigger')
    const Component = asChild ? Slot : 'button'

    return (
        <Component
            type={asChild ? undefined : 'button'}
            data-state={open ? 'open' : 'closed'}
            aria-expanded={open}
            className={cn(className)}
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                onClick?.(event)
                if (event.defaultPrevented) return
                setOpen(!open)
            }}
            {...props}/>
    )
}

interface CollapsibleContentProps extends React.HTMLAttributes<HTMLDivElement> {
    forceMount?: boolean
}

function CollapsibleContent({
    forceMount,
    className,
    ...props
}: CollapsibleContentProps) {
    const { open } = useCollapsibleContext('CollapsibleContent')

    if (!forceMount && !open) return null

    return (
        <div
            data-state={open ? 'open' : 'closed'}
            hidden={!open}
            className={cn(className)}
            {...props}/>
    )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
