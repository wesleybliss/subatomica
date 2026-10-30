import { definePlugin } from 'nitro'

export default definePlugin(nitroApp => {
    nitroApp.hooks.hook('request', event => {
        
        // @ts-expect-error nitro node types
        const res = event.node.res
        
        // @ts-expect-error nitro node types
        const origin = event.node.req.headers.origin
        res.setHeader('access-control-allow-origin', origin ?? '*')
        res.setHeader('access-control-allow-methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
        res.setHeader('access-control-allow-headers', '*')
        res.setHeader('access-control-allow-credentials', 'true')
        
        // @ts-expect-error nitro node types
        if (event.method === 'OPTIONS') {
            res.statusCode = 204
            res.end()
        }
        
    })
})
