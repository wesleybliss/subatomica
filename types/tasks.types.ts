
export type TaskStatus = string

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface Task {
    id: string
    userId: string
    projectId: string
    title: string
    description: string
    status: TaskStatus
    priority: TaskPriority | null
    dueDate: string | null
    assigneeId: string | null
    order: number
    createdAt: string
    updatedAt: string
    deletedAt: string | null
}

export type CreateTaskInput = {
    status: TaskStatus
    tempId: string
}

export type UpdateTaskOrderInput = {
    taskId: string
    status: TaskStatus
    order: number
}
