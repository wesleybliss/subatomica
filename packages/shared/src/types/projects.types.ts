import { TaskLane } from '@/types/lanes.types'

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
