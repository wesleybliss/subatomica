'use client'

import * as React from 'react'

type SlotProps = React.HTMLAttributes<HTMLElement> & {
    children?: React.ReactNode
}

function composeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
    return (node: T) => {
        for (const ref of refs) {
            if (!ref) continue
            if (typeof ref === 'function') {
                ref(node)
            } else {
                ;(ref as React.MutableRefObject<T | null>).current = node
            }
        }
    }
}

const Slot = React.forwardRef<HTMLElement, SlotProps>(
    ({ children, ...props }, forwardedRef) => {
        if (!React.isValidElement(children)) return null
        const child = children as React.ReactElement
        const childRef = (child as unknown as { ref?: React.Ref<HTMLElement> }).ref
        return React.cloneElement(child, {
            ...(props as Record<string, unknown>),
            ref: composeRefs(forwardedRef, childRef),
        } as Record<string, unknown>)
    },
)

Slot.displayName = 'Slot'

export { Slot }
