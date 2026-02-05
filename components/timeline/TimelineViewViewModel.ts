'use client'
import { useMemo } from 'react'
import { format, addDays, differenceInDays, isValid, parseISO } from 'date-fns'
import type { Project, Task } from '@/types'

const toDate = (value: string | null) => {
    if (!value)
        return null
    const date = parseISO(value)
    return isValid(date) ? date : null
}

type TimelineViewModelInput = {
    projects: Project[]
    tasks: Task[]
}

type DatedTask = Task & {
    due: Date | null
    start: Date | null
}

type TimelineData = {
    rangeStart: Date
    rangeEnd: Date
    dayCount: number
    tasksByProject: Record<string, DatedTask[]>
}

const TimelineViewModel = ({ projects, tasks }: TimelineViewModelInput) => {
    const { rangeStart, rangeEnd, tasksByProject, dayCount }: TimelineData = useMemo(() => {
        const datedTasks: DatedTask[] = tasks
            .map(task => ({
                ...task,
                due: toDate(task.dueDate),
                start: toDate(task.createdAt) || toDate(task.dueDate),
            }))
            .filter((task): task is DatedTask & { due: Date; start: Date } => 
                task.due !== null && task.start !== null,
            )
        
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
        const grouped: Record<string, DatedTask[]> = {}
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
    
    const formatDateRange = () => ({
        start: format(rangeStart, 'MMM d'),
        end: format(rangeEnd, 'MMM d'),
    })
    
    const getTaskPosition = (task: DatedTask) => {
        const startIndex = differenceInDays(task.start as Date, rangeStart)
        const endIndex = differenceInDays(task.due as Date, rangeStart)
        const left = Math.max(0, startIndex) / dayCount * 100
        const width = Math.max(1, endIndex - startIndex + 1) / dayCount * 100
        return { left, width }
    }
    
    return {
        // Data
        projects,
        tasksByProject,
        timelineDays,
        dayCount,
        
        // Styles
        gridTemplateColumns,
        
        // Methods
        formatDateRange,
        getTaskPosition,
    }
}

export default TimelineViewModel
