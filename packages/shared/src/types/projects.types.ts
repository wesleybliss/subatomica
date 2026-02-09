import { TaskLane } from './lanes.types'

export interface Project {
    id: string
    createdAt: string
    updatedAt: string
    ownerId: string
    teamId: string
    name: string
    slug: string
    taskSequence: number
    description: string
    
    taskLanes?: TaskLane[]
}

export type CreateProjectInput = {
    name: string
    tempId: string
}

export type ProjectDetailView = 'kanban' | 'timeline' | 'list'
