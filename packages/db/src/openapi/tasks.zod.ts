import { z } from '@hono/zod-openapi'
import { createSelectSchema } from 'drizzle-zod'

import { tasks } from '../turso/schema.turso'

const TaskBaseSchema = createSelectSchema(tasks).extend({
    id: z.string().openapi({
        example: '019c416f-d018-721f-b332-e9424030c6a8',
    }),
    projectId: z.string().openapi({
        example: '019c416f-d018-721f-b332-e9424030c6a8',
    }),
    userId: z.string().openapi({
        example: '019c416f-d018-721f-b332-e9424030c6a8',
    }),
    localId: z.number().int().openapi({
        example: 1,
    }),
    key: z.string().nullable().openapi({
        example: 'ENGI-4',
        description: 'Stable task key set at creation; does not change if the project is renamed',
    }),
    title: z.string().openapi({
        example: 'Set up OpenAPI docs',
    }),
    status: z.string().openapi({
        example: 'backlog',
    }),
    priority: z.string().nullable().openapi({
        example: 'medium',
    }),
    dueDate: z.string().nullable().openapi({
        example: '2025-01-01T00:00:00.000Z',
    }),
    assigneeId: z.string().nullable().openapi({
        example: '019c416f-d018-721f-b332-e9424030c6a8',
    }),
    order: z.number().int().openapi({
        example: 1000,
    }),
    isStarred: z.boolean().openapi({
        example: false,
    }),
})

export const TaskSchema = TaskBaseSchema.openapi('Task')

export type Task = z.infer<typeof TaskSchema>
