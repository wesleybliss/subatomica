import { z } from '@hono/zod-openapi'

export const ErrorSchema = z
    .object({
        error: z.string().openapi({
            example: 'Unauthorized',
        }),
    })
    .openapi('Error')

export const SuccessSchema = z
    .object({
        success: z.boolean().openapi({
            example: true,
        }),
    })
    .openapi('Success')
