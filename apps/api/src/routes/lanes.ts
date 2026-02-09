import { Context, Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { z } from 'zod'
import { zValidator } from '@/lib/honoZodValidator'
import * as lanesService from '@/services/lanes'
import { ApiAppEnv } from '@/env'

const LaneParamSchema = z.object({
    laneId: z.string(),
})

const LaneQuerySchema = z.object({
    teamId: z.string(),
    projectId: z.string(),
})

const laneParamValidator = zValidator('param', LaneParamSchema)
const laneQueryValidator = zValidator('query', LaneQuerySchema)

type LaneContext = Context<ApiAppEnv, string, {
    out: {
        query: z.infer<typeof LaneQuerySchema>,
        param: z.infer<typeof LaneParamSchema>,
    }
}>

const TaskLaneCreateSchema = z.object({
    key: z.string().min(1).optional(),
    name: z.string().min(1).optional(),
    color: z.string().nullable().optional(),
    order: z.number().int().optional(),
    isDefault: z.boolean().optional(),
    tempId: z.string().optional(),
})

const TaskLaneUpdateSchema = z.object({
    key: z.string().min(1).optional(),
    name: z.string().min(1).optional(),
    color: z.string().nullable().optional(),
    order: z.number().int().optional(),
    isDefault: z.boolean().optional(),
}).refine(value => Object.keys(value).length > 0, {
    message: 'At least one field is required',
})

const handleRouteError = (error: unknown) => {
    if (error instanceof HTTPException)
        throw error
    
    const message = error instanceof Error
        ? error.message
        : 'Unknown error'
    
    if (message.startsWith('Forbidden:'))
        throw new HTTPException(403, { message })
    if (message.startsWith('NotFound:'))
        throw new HTTPException(404, { message })
    if (message.startsWith('Conflict:'))
        throw new HTTPException(409, { message })
    
    throw new HTTPException(400, { message })
}

export const getTaskLanes = async (c: LaneContext) => {
    try {
        const user = c.get('user')
        
        if (!user)
            throw new HTTPException(401, { message: 'Unauthorized' })
        
        const { teamId, projectId } = c.req.valid('query')
        const lanes = await lanesService.getTaskLanes(user.id, teamId, projectId)
        return c.json(lanes)
    } catch (error) {
        handleRouteError(error)
    }
}

export const createTaskLane = async (c: LaneContext) => {
    try {
        const user = c.get('user')
        
        if (!user)
            throw new HTTPException(401, { message: 'Unauthorized' })
        
        const { teamId, projectId } = c.req.valid('query')
        const payload = TaskLaneCreateSchema.parse(await c.req.json())
        const lane = await lanesService.createTaskLane(user.id, teamId, projectId, payload)
        return c.json(lane, 201)
    } catch (error) {
        handleRouteError(error)
    }
}

export const updateTaskLane = async (c: LaneContext) => {
    try {
        const user = c.get('user')
        
        if (!user)
            throw new HTTPException(401, { message: 'Unauthorized' })
        
        const { laneId } = c.req.valid('param')
        const { teamId, projectId } = c.req.valid('query')
        const payload = TaskLaneUpdateSchema.parse(await c.req.json())
        const lane = await lanesService.updateTaskLane(user.id, teamId, projectId, laneId, payload)
        return c.json(lane)
    } catch (error) {
        handleRouteError(error)
    }
}

export const deleteTaskLane = async (c: LaneContext) => {
    try {
        const user = c.get('user')
        
        if (!user)
            throw new HTTPException(401, { message: 'Unauthorized' })
        
        const { laneId } = c.req.valid('param')
        const { teamId, projectId } = c.req.valid('query')
        await lanesService.deleteTaskLane(user.id, teamId, projectId, laneId)
        return c.json({ success: true })
    } catch (error) {
        handleRouteError(error)
    }
}

const routes = new Hono<ApiAppEnv>()
    .get('/', laneQueryValidator, getTaskLanes)
    .post('/', laneQueryValidator, createTaskLane)
    .patch('/:laneId', laneParamValidator, laneQueryValidator, updateTaskLane)
    .delete('/:laneId', laneParamValidator, laneQueryValidator, deleteTaskLane)

export default routes
