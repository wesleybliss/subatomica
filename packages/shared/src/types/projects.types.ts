import { TaskLane } from './lanes.types'

export interface Project {
    id: string
    createdAt: string
    updatedAt: string
    ownerId: string
    teamId: string
    name: string
    description: string
    
    taskLanes?: TaskLane[]
}

export type ProjectDetailView = 'kanban' | 'timeline' | 'list'
