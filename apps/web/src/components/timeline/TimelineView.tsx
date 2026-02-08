import { format } from 'date-fns'
import type { Project, Task } from '@repo/shared/types'
import { cn } from '@/lib/utils'
import TimelineViewModel from './TimelineViewViewModel'

type TimelineViewProps = {
    projects: Project[]
    tasks: Task[]
}

const TimelineView = ({ projects, tasks }: TimelineViewProps) => {
    
    const {
        tasksByProject,
        timelineDays,
        gridTemplateColumns,
        formatDateRange,
        getTaskPosition,
    } = TimelineViewModel({ projects, tasks })
    
    const dateRange = formatDateRange()
    
    return (
        
        <div className={cn(
            'flex h-full flex-col gap-6 overflow-hidden projects-6',
            'bg-[radial-gradient(circle_at_top,var(--color-border),transparent_60%)]',
        )}>
            
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Timeline</p>
                    <h1 className="text-lg font-semibold text-foreground">Milestones & delivery arcs</h1>
                </div>
                <div className="text-xs text-muted-foreground">
                    {dateRange.start} – {dateRange.end}
                </div>
            </div>
            
            <div
                className={cn(
                    'flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border',
                    'bg-background/80 shadow-sm',
                )}>
                <div className={cn(
                    'flex items-center gap-4 border-b border-border',
                    'bg-muted/30 px-4 py-3 text-xs font-medium text-muted-foreground',
                )}>
                    <div className="w-48">Project</div>
                    <div className="flex-1 grid" style={{ gridTemplateColumns }}>
                        {timelineDays.map(day => (
                            <div key={day.toISOString()} className="text-center">
                                {format(day, 'd')}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex-1 overflow-auto">
                    {projects.map(project => {
                        const projectTasks = tasksByProject[project.id] || []
                        return (
                            <div
                                key={project.id}
                                className={cn(
                                    'flex items-center gap-4 border-b border-border/60 px-4 py-4',
                                )}>
                                <div className="w-48">
                                    <p className="text-sm font-medium text-foreground">{project.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {project.description || 'No description'}
                                    </p>
                                </div>
                                <div className="relative flex-1" style={{ minHeight: 48 }}>
                                    <div className="absolute inset-0 grid" style={{ gridTemplateColumns }}>
                                        {timelineDays.map(day => (
                                            <div key={day.toISOString()} className="border-l border-border/40" />
                                        ))}
                                    </div>
                                    {projectTasks.map(task => {
                                        const { left, width } = getTaskPosition(task)
                                        return (
                                            <div
                                                key={task.id}
                                                className={cn(
                                                    'absolute top-2 rounded-full bg-primary/80',
                                                    'px-2 py-1 text-[11px] text-primary-foreground shadow-sm',
                                                )}
                                                style={{ left: `${left}%`, width: `${width}%` }}>
                                                {task.title}
                                            </div>
                                        )
                                    })}
                                    {projectTasks.length === 0 && (
                                        <div className="absolute left-4 top-3 text-xs text-muted-foreground">
                                            No dated tasks yet
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        
        </div>
        
    )
    
}

export default TimelineView
