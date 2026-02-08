import { testClient } from 'hono/testing'
import { describe, it, expect } from 'vitest'
import { createApiServer } from '@/app'
import pkg from '../../../package.json'
import { createAuth } from '@/services/auth'
import { ApiAppEnv } from '@/env'
import { Hono } from 'hono'

// import { hc } from 'hono/client'
// import type { AppType } from '@/app'
// export const $client: ReturnType<typeof hc<AppType>> = {} as any

describe('Sanity check', () => {
    
    const auth = createAuth()
    const app = createApiServer(auth)
    const client = testClient<Hono<ApiAppEnv>>(app)
    
    it('should return the version', async () => {
        
        const res = await client.$get()
        
        expect(res.status).toBe(200)
        expect(await res.json()).toEqual({
            version: pkg.version,
        })
        
        // Unauthenticated call to /teams should fail
        expect((await client.t.$get()).status).toBe(401)
        
    })
    
    it('should authorize a user', async () => {
        //auth/sign-up
        console.log('@@@@@@@@', client.auth.signInEmailPassword.toString())
        
        const res = await client.auth.signInEmailPassword('foo@gmail.com', 'bar')
        
        expect(res.status).toBe(200)
        
    })
    
    /*it('should return the version', async () => {
        
        const res = await client.teams.$get()
        
        // Assertions
        expect(res.status).toBe(200)
        expect(await res.json()).toEqual({
            query: 'hono',
            results: ['result1', 'result2'],
        })
    })*/
    
})
