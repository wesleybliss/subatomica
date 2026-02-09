import { zValidator as zv } from '@hono/zod-validator'
import { ValidationTargets } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { ZodSchema } from 'zod'

export const zValidator = <
    T extends ZodSchema,
    Target extends keyof ValidationTargets,
>(target: Target, schema: T) => {
    
    return zv(target, schema, result => {
        
        if (!result.success)
            throw new HTTPException(400, { cause: result.error })
        
    })
    
}
