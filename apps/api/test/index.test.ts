import { testClient } from 'hono/testing'
import { describe, it, expect } from 'vitest'
import { createApp } from '@/app'
import pkg from '../../../package.json'
import { createAuth } from '@/services/auth'

import { hc } from 'hono/client'
import type { AppType } from '@/app'

export const $client: ReturnType<typeof hc<AppType>> = {} as any

describe('Sanity check', () => {
    
    const auth = createAuth()
    const app = createApp(auth)
    const client = testClient(app)
    
    it('should return the version', async () => {
        
        const res = await client.$get()
        
        expect(res.status).toBe(200)
        expect(await res.json()).toEqual({
            version: pkg.version,
        })
        
        // Unauthenticated call to /t should fail
        expect((await client.t.$get()).status).toBe(401)
        
    })
    
    it('should authorize a user', async () => {
        //auth/sign-up
        console.log('@@@@@@@@', client.auth.signInEmailPassword.toString())
        
        const res = await client.auth.signInEmailPassword('foo@gmail.com', 'bar')
        
        expect(res.status).toBe(200)
    
    })
    
    /*it('should return the version', async () => {
        
        const res = await client.t.$get()
        
        // Assertions
        expect(res.status).toBe(200)
        expect(await res.json()).toEqual({
            query: 'hono',
            results: ['result1', 'result2'],
        })
    })*/
    
})
