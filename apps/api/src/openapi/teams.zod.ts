import { z } from '@hono/zod-openapi'

export const UserSchema = z
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
        emailVerified: z.boolean().openapi({
            example: true,
        }),
        image: z.string().openapi({
            example: 'https://example.com/john.doe.png',
        }),
    })
    .openapi('User')
