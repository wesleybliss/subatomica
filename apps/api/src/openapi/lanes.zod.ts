import { z } from '@hono/zod-openapi'
import { createSelectSchema } from 'drizzle-zod'

import { taskLanes } from '@/db/schema'

const TaskLaneBaseSchema = createSelectSchema(taskLanes).extend({
    id: z.string().openapi({
        example: '019c416f-d018-721f-b332-e9424030c6a8',
    }),
    projectId: z.string().openapi({
        example: '019c416f-d018-721f-b332-e9424030c6a8',
    }),
    key: z.string().openapi({
        example: 'todo',
    }),
    name: z.string().openapi({
        example: 'To Do',
    }),
    color: z.string().nullable().openapi({
        example: '#f97316',
    }),
    order: z.number().int().openapi({
        example: 1000,
    }),
    isDefault: z.boolean().openapi({
        example: false,
    }),
})

export const TaskLaneSchema = TaskLaneBaseSchema.openapi('TaskLane')
