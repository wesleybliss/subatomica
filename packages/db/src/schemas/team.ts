import { z } from 'zod'

export const TeamSchema = z.object({
    id: z.string(),
    ownerId: z.string(),
    name: z.string(),
    slug: z.string(),
})

export type Team = z.infer<typeof TeamSchema>
