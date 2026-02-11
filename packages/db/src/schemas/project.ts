import { z } from 'zod'

export const ProjectSchema = z.object({
    id: z.string(),
    ownerId: z.string(),
    teamId: z.string(),
    name: z.string(),
    description: z.string(),
    isStarred: z.boolean(),
})

export type Project = z.infer<typeof ProjectSchema>
