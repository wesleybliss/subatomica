'use client'
import { useMemo } from 'react'
import { format, addDays, differenceInDays, isValid, parseISO } from 'date-fns'
import type { Project, Task } from '@/types'
type TimelineViewProps = {
    projects: Project[]
    tasks: Task[]
}
const toDate = (value: string | null) => {
    if (!value)
        return null
    const date = parseISO(value)
    return isValid(date) ? date : null
}

export function TimelineView({ projects, tasks }: TimelineViewProps) {
    const { rangeStart, rangeEnd, tasksByProject, dayCount } = useMemo(() => {
        const datedTasks = tasks
            .map(task => ({
                ...task,
                due: toDate(task.dueDate),
                start: toDate(task.createdAt) || toDate(task.dueDate),
            }))
            .filter(task => task.due && task.start)
        const startDates = datedTasks.map(task => task.start as Date)
        const endDates = datedTasks.map(task => task.due as Date)
        const fallbackStart = new Date()
        const minDate = startDates.length
            ? new Date(Math.min(...startDates.map(d => d.getTime())))
            : fallbackStart
        const maxDate = endDates.length
            ? new Date(Math.max(...endDates.map(d => d.getTime())))
            : addDays(fallbackStart, 14)
        const safeStart = addDays(minDate, -1)
        const safeEnd = addDays(maxDate, 3)
        const dayCount = Math.max(1, differenceInDays(safeEnd, safeStart) + 1)
        const grouped: Record<string, typeof datedTasks> = {}
        datedTasks.forEach(task => {
            if (!grouped[task.projectId])
                grouped[task.projectId] = []
            grouped[task.projectId].push(task)
        })
        return {
            rangeStart: safeStart,
            rangeEnd: safeEnd,
            tasksByProject: grouped,
            dayCount,
        }
    }, [tasks])
    const timelineDays = useMemo(() => {
        return Array.from({ length: dayCount }).map((_, index) =>
            addDays(rangeStart, index),
        )
    }, [dayCount, rangeStart])
    const gridTemplateColumns = `repeat(${dayCount}, minmax(28px, 1fr))`
    const headerRowClassName = [
        'flex items-center gap-4 border-b border-border',
        'bg-muted/30 px-4 py-3 text-xs font-medium text-muted-foreground',
    ].join(' ')
    const projectRowClassName = [
        'flex items-center gap-4 border-b border-border/60 px-4 py-4',
    ].join(' ')
    return (
        <div
            className={[
                'flex h-full flex-col gap-6 overflow-hidden p-6',
                'bg-[radial-gradient(circle_at_top,_var(--color-border),_transparent_60%)]',
            ].join(' ')}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Timeline</p>
                    <h1 className="text-lg font-semibold text-foreground">Milestones & delivery arcs</h1>
                </div>
                <div className="text-xs text-muted-foreground">
                    {format(rangeStart, 'MMM d')} – {format(rangeEnd, 'MMM d')}
                </div>
            </div>
            <div
                className={[
                    'flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border',
                    'bg-background/80 shadow-sm',
                ].join(' ')}>
                <div className={headerRowClassName}>
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
                                className={projectRowClassName}>
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
                                        const startIndex = differenceInDays(task.start as Date, rangeStart)
                                        const endIndex = differenceInDays(task.due as Date, rangeStart)
                                        const left = Math.max(0, startIndex) / dayCount * 100
                                        const width = Math.max(1, endIndex - startIndex + 1) / dayCount * 100
                                        return (
                                            <div
                                                key={task.id}
                                                className={[
                                                    'absolute top-2 rounded-full bg-primary/80',
                                                    'px-2 py-1 text-[11px] text-primary-foreground shadow-sm',
                                                ].join(' ')}
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
