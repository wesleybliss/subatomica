import { Flag } from 'lucide-react'
import { KanbanTask } from './KanbanBoard'

interface KanbanCardProps {
    task: KanbanTask
    selected: boolean
    onToggle: () => void
    onClick: () => void
}

export function KanbanCard({ task, selected, onToggle, onClick }: KanbanCardProps) {
    return (
        <div
            className={`group relative bg-card border border-border rounded-lg p-4 cursor-pointer transition-all hover:border-primary/50 ${
                selected ? 'border-primary ring-2 ring-primary/20' : ''
            }`}
            onClick={onClick}
        >
            {/* Header with ID and Toggle */}
            <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">{task.projectId}</span>
                </div>
                <button
                    type="button"
                    onClick={e => {
                        e.stopPropagation()
                        onToggle()
                    }}
                    className={`w-10 h-5 rounded-full transition-colors ${
                        selected ? 'bg-primary' : 'bg-muted'
                    }`}
                >
                    <div
                        className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                            selected ? 'translate-x-5' : 'translate-x-0.5'
                        }`}
                    />
                </button>
            </div>

            {/* Title */}
            <h4 className="text-sm font-medium text-card-foreground mb-3 leading-snug">
                {task.title}
            </h4>

            {/* Footer with Assignee and Date */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {task.assignee && (
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                                <span className="text-xs font-medium text-primary">
                                    {task.assignee.name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <span className="text-xs text-muted-foreground">{task.assignee.name}</span>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {task.date && (
                        <span className="text-xs text-muted-foreground">{task.date}</span>
                    )}
                    {task.flagged && (
                        <Flag className="w-3 h-3 text-destructive fill-destructive" />
                    )}
                </div>
            </div>
        </div>
    )
}
