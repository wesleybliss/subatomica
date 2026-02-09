import { createSelectSchema } from 'drizzle-zod'
import { projects } from '@/db/schema'
import { z } from '@hono/zod-openapi'
import { TaskLaneSchema } from '@/openapi/lanes.zod'

const ProjectBaseSchema = createSelectSchema(projects).extend({
    id: z.string().openapi({
        example: '019c416f-d018-721f-b332-e9424030c6a8',
    }),
    name: z.string().openapi({
        example: 'Sub-Atomica',
    }),
    slug: z.string().openapi({
        example: 'sub-atomica',
    }),
    ownerId: z.string().openapi({
        example: '019c416f-d018-721f-b332-e9424030c6a8',
    }),
    teamId: z.string().openapi({
        example: '019c416f-d018-721f-b332-e9424030c6a8',
    }),
    description: z.string().openapi({
        example: 'Project planning and execution',
    }),
    isStarred: z.boolean().openapi({
        example: false,
    }),
})

export const ProjectSchema = ProjectBaseSchema.openapi('Project')

export const ProjectWithLanesSchema = ProjectBaseSchema.extend({
    taskLanes: z.array(TaskLaneSchema).openapi({
        example: [],
    }),
}).openapi('ProjectWithLanes')
