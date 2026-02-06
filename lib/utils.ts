import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Task } from '@/types'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const calculateProjectProgress = (tasks: Task[], asPercentage: boolean = true): number => {
    
    // @todo "done" is kind of arbitrary, should be an enum somewhere
    const total = tasks.length
    const completed = tasks.filter(task => task.status === 'done').length
    
    return asPercentage ? (completed / total) * 100 : completed
    
}
