import { TaskStatus } from './tasks.types'

export type CreateProjectResult = {
    error: string | null
}

export type DropIndicatorData = {
    status: TaskStatus
    taskId?: string
}
