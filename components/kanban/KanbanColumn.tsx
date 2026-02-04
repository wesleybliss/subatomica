import { ReactNode } from 'react'

interface KanbanColumnProps {
    title: string
    count: number
    children?: ReactNode
}

export function KanbanColumn({ title, count, children }: KanbanColumnProps) {
    return (
        <div className="flex flex-col min-w-[300px] w-[300px] gap-3">
            <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    {count}
                </span>
            </div>
            <div className="flex flex-col gap-3 min-h-[200px]">
                {children}
            </div>
        </div>
    )
}
