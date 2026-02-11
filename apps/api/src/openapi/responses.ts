import type { z } from '@hono/zod-openapi'
import { ErrorSchema } from '@repo/db/openapi'

type Schema = z.ZodTypeAny

type ResponseContent = {
    description: string
    content: {
        'application/json': {
            schema: Schema
        }
    }
}

type Responses = Record<number, ResponseContent>

const responseJson = (status: number, description: string, schema: Schema): Responses => ({
    [status]: {
        description,
        content: {
            'application/json': {
                schema,
            },
        },
    },
})

export const response200 = (schema: Schema, description: string) =>
    responseJson(200, description, schema)

export const response201 = (schema: Schema, description: string) =>
    responseJson(201, description, schema)

export const response400 = (schema: Schema, description = 'Invalid request') =>
    responseJson(400, description, schema)

export const response401 = (schema: Schema, description = 'Unauthorized') =>
    responseJson(401, description, schema)

export const response403 = (schema: Schema, description = 'Forbidden') =>
    responseJson(403, description, schema)

export const response404 = (schema: Schema, description = 'Not found') =>
    responseJson(404, description, schema)

export const response409 = (schema: Schema, description = 'Conflict') =>
    responseJson(409, description, schema)

export const response422 = (schema: Schema, description = 'Missing parameter') =>
    responseJson(422, description, schema)

export const response500 = (schema: Schema, description = 'Server error') =>
    responseJson(500, description, schema)

const defaultErrorDescriptions: Record<number, string> = {
    400: 'Invalid request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not found',
    409: 'Conflict',
    422: 'Missing parameter',
    500: 'Server error',
}

type CreateResponsesOptions = {
    successStatus?: number
    successDescription: string
    errorStatuses?: number[]
    errorSchema?: Schema
    errorDescriptions?: Partial<Record<number, string>>
}

export const createResponses = (
    schema: Schema,
    {
        successStatus = 200,
        successDescription,
        errorStatuses = [401, 404, 500],
        errorSchema = ErrorSchema,
        errorDescriptions = {},
    }: CreateResponsesOptions,
): Responses => {
    const errorResponses = errorStatuses.reduce<Responses>((acc, status) => {
        const description = errorDescriptions[status] || defaultErrorDescriptions[status] || 'Error'
        return {
            ...acc,
            ...responseJson(status, description, errorSchema),
        }
    }, {})
    
    return {
        ...responseJson(successStatus, successDescription, schema),
        ...errorResponses,
    }
}
