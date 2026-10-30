import type { CSSProperties } from 'react'

import { cn } from '@/lib/utils'

/** Card-shaped drop preview — same footprint as a kanban card. */
export const KanbanDropGhost = ({
    className,
    style,
}: {
    className?: string
    style?: CSSProperties
}) => (
    <div
        aria-hidden
        className={cn(
            'rounded-lg border border-dashed border-primary/50 bg-primary/5',
            'min-h-24 pointer-events-none',
            className,
        )}
        style={style} />
)
