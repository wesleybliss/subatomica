export type { ProjectWithOptionalLanes as Project } from '@repo/db/types'

export type CreateProjectInput = {
    name: string
    tempId: string
}

export type ProjectDetailView = 'kanban' | 'timeline' | 'list'
