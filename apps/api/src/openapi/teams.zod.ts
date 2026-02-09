import { z } from '@hono/zod-openapi'
import { createSelectSchema } from 'drizzle-zod'

import { teams } from '@/db/schema'

const TeamBaseSchema = createSelectSchema(teams).extend({
    id: z.string().openapi({
        example: '019c416f-d018-721f-b332-e9424030c6a8',
    }),
    name: z.string().openapi({
        example: 'Personal',
    }),
    slug: z.string().openapi({
        example: 'personal',
    }),
    ownerId: z.string().openapi({
        example: '019c416f-d018-721f-b332-e9424030c6a8',
    }),
})

export const TeamSchema = TeamBaseSchema.openapi('Team')

export const TeamMemberSchema = z
    .object({
        id: z.string().openapi({
            example: '019c416f-d018-721f-b332-e9424030c6a8',
        }),
        name: z.string().openapi({
            example: 'John Doe',
        }),
        email: z.string().openapi({
            example: 'john.doe@gmail.com',
        }),
        image: z.string().nullable().openapi({
            example: 'https://example.com/john.doe.png',
        }),
        role: z.enum(['owner', 'admin', 'member']).openapi({
            example: 'member',
        }),
    })
    .openapi('TeamMember')
