import type { TaskStatus } from '@repo/shared/types'

export type TaskDragData = {
    type: 'task'
    taskId: string
    status: TaskStatus
}

export type TaskDropData = {
    type: 'task'
    taskId: string
    status: TaskStatus
}

export type ColumnDropData = {
    type: 'column'
    status: TaskStatus
}

export const isTaskDragData = (data: Record<string, unknown>): data is TaskDragData =>
    data.type === 'task'
    && typeof data.taskId === 'string'
    && typeof data.status === 'string'

export const isTaskDropData = (data: Record<string, unknown>): data is TaskDropData =>
    data.type === 'task'
    && typeof data.taskId === 'string'
    && typeof data.status === 'string'

export const isColumnDropData = (data: Record<string, unknown>): data is ColumnDropData =>
    data.type === 'column'
    && typeof data.status === 'string'
