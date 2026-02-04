export type TaskStatus = 'backlog' | 'todo' | 'in-progress' | 'done'

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface Task {
    id: string
    userId: string
    projectId: string
    title: string
    content: string
    status: TaskStatus
    priority: TaskPriority | null
    dueDate: string | null
    assigneeId: string | null
    order: number
    createdAt: string
    updatedAt: string
    deletedAt: string | null
}
