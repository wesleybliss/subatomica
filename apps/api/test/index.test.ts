import { testClient } from 'hono/testing'
import { describe, expect,it } from 'vitest'

import { AppType,createApiServer } from '@/app'
import { createAuth } from '@/services/auth'

import pkg from '../../../package.json' assert { type: 'json' }

describe('Sanity check', () => {
    
    const auth = createAuth()
    const app = createApiServer(auth)
    const client = testClient<AppType>(app)
    
    it('should return the version', async () => {
        
        const res = await client.index.$get()
        
        expect(res.status).toBe(200)
        expect(await res.json()).toEqual({
            version: pkg.version,
        })
        
        // Unauthenticated call to /teams should fail
        expect((await client.teams.$get()).status).toBe(401)
        
    })
    
    /*it('should authorize a user', async () => {
        //auth/sign-up
        console.log('@@@@@@@@', client.auth.signInEmailPassword.toString())
        
        const res = await client.auth.signInEmailPassword('foo@gmail.com', 'bar')
        
        expect(res.status).toBe(200)
        
    })*/
    
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
