
export type TaskLane = {
    id: string
    projectId: string
    key: string
    name: string
    color: string | null
    order: number
    isDefault: boolean
}

export type CreateLaneInput = {
    key: string
    name: string
    color?: string | null
    order?: number
    tempId: string
}
