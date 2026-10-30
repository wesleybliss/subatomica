import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import Logger from '@repo/shared/utils/logger'

import { ApiAppEnv } from '@/env'
import { createResponses } from '@/openapi/responses'
import { getTrelloOAuthConfig } from '@/services/trello/config'
import * as trelloImport from '@/services/trello/import'
import * as trelloMembers from '@/services/trello/members'
import * as trelloOauth from '@/services/trello/oauth'
import {
    handleWebhookPayload,
    verifyTrelloWebhookSignature,
} from '@/services/trello/webhooks'

const log = new Logger('api/routes/trello')

const StatusSchema = z.object({
    configured: z.boolean(),
    connected: z.boolean(),
    connection: z.object({
        id: z.string(),
        teamId: z.string(),
        trelloMemberId: z.string(),
        trelloUsername: z.string().nullable(),
        createdAt: z.string(),
    }).nullable(),
}).openapi('TrelloStatus')

const TeamIdQuery = z.object({
    teamId: z.string().min(1),
})

const MemberMappingSchema = z.object({
    trelloMemberId: z.string().min(1),
    email: z.string().email(),
    trelloUsername: z.string().nullable().optional(),
    trelloFullName: z.string().nullable().optional(),
})

const ImportBodySchema = z.object({
    teamId: z.string().min(1),
    workspaceMappings: z.array(z.object({
        trelloWorkspaceId: z.string(),
        trelloWorkspaceName: z.string(),
        teamId: z.string().nullable().optional(),
        createTeamName: z.string().optional(),
    })),
    boardMappings: z.array(z.object({
        trelloBoardId: z.string(),
        teamId: z.string().optional(),
        projectId: z.string().nullable().optional(),
        createProjectName: z.string().optional(),
        syncEnabled: z.boolean().optional(),
    })).min(1),
    memberMappings: z.array(MemberMappingSchema).optional(),
}).openapi('TrelloImportRequest')

const MemberMappingsBodySchema = z.object({
    teamId: z.string().min(1),
    mappings: z.array(MemberMappingSchema).min(1),
}).openapi('TrelloMemberMappingsRequest')

const SyncBodySchema = z.object({
    syncEnabled: z.boolean(),
}).openapi('TrelloSyncToggle')

const getStatusRoute = createRoute({
    method: 'get',
    path: '/status',
    tags: ['Trello'],
    security: [{ bearerAuth: [] }],
    request: {
        query: TeamIdQuery,
    },
    responses: createResponses(StatusSchema, {
        successDescription: 'Trello connection status for a team',
        errorStatuses: [401, 403, 500],
    }),
})

const authorizeRoute = createRoute({
    method: 'get',
    path: '/authorize',
    tags: ['Trello'],
    security: [{ bearerAuth: [] }],
    request: {
        query: z.object({
            teamId: z.string().min(1),
            returnTeamSlug: z.string().optional(),
        }),
    },
    responses: createResponses(z.object({ url: z.string() }), {
        successDescription: 'Authorization URL',
        errorStatuses: [400, 401, 403, 500],
    }),
})

const disconnectRoute = createRoute({
    method: 'delete',
    path: '/connection',
    tags: ['Trello'],
    security: [{ bearerAuth: [] }],
    request: {
        query: TeamIdQuery,
    },
    responses: createResponses(z.object({ ok: z.boolean() }), {
        successDescription: 'Disconnected',
        errorStatuses: [401, 403, 500],
    }),
})

const catalogRoute = createRoute({
    method: 'get',
    path: '/catalog',
    tags: ['Trello'],
    security: [{ bearerAuth: [] }],
    request: {
        query: TeamIdQuery,
    },
    responses: createResponses(z.any(), {
        successDescription: 'Trello workspaces, boards, and existing links',
        errorStatuses: [401, 403, 404, 500],
    }),
})

const membersRoute = createRoute({
    method: 'get',
    path: '/members',
    tags: ['Trello'],
    security: [{ bearerAuth: [] }],
    request: {
        query: z.object({
            teamId: z.string().min(1),
            boardIds: z.string().optional(),
        }),
    },
    responses: createResponses(z.any(), {
        successDescription: 'Trello members for selected or linked boards',
        errorStatuses: [401, 403, 404, 500],
    }),
})

const memberMappingsRoute = createRoute({
    method: 'post',
    path: '/member-mappings',
    tags: ['Trello'],
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: MemberMappingsBodySchema,
                },
            },
        },
    },
    responses: createResponses(z.any(), {
        successDescription: 'Saved member email mappings',
        errorStatuses: [400, 401, 403, 404, 500],
    }),
})

const importRoute = createRoute({
    method: 'post',
    path: '/import',
    tags: ['Trello'],
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: ImportBodySchema,
                },
            },
        },
    },
    responses: createResponses(z.any(), {
        successDescription: 'Import results',
        errorStatuses: [400, 401, 403, 404, 500],
    }),
})

const syncRoute = createRoute({
    method: 'post',
    path: '/boards/{boardLinkId}/sync',
    tags: ['Trello'],
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({ boardLinkId: z.string() }),
        body: {
            content: {
                'application/json': {
                    schema: SyncBodySchema,
                },
            },
        },
    },
    responses: createResponses(z.any(), {
        successDescription: 'Updated sync setting',
        errorStatuses: [401, 403, 404, 500],
    }),
})

const resyncRoute = createRoute({
    method: 'post',
    path: '/boards/{boardLinkId}/resync',
    tags: ['Trello'],
    security: [{ bearerAuth: [] }],
    request: {
        params: z.object({ boardLinkId: z.string() }),
    },
    responses: createResponses(z.any(), {
        successDescription: 'Re-synced board',
        errorStatuses: [401, 403, 404, 500],
    }),
})

const mapServiceError = (err: unknown) => {
    const message = err instanceof Error ? err.message : 'Unknown error'
    if (message.startsWith('NotFound:'))
        return { status: 404 as const, message }
    if (message.startsWith('Forbidden:'))
        return { status: 403 as const, message }
    if (message.startsWith('BadRequest:'))
        return { status: 400 as const, message }
    if (message.startsWith('Conflict:'))
        return { status: 409 as const, message }
    return { status: 500 as const, message }
}

const protectedRoutes = new OpenAPIHono<ApiAppEnv>()

protectedRoutes.openapi(getStatusRoute, async c => {
    const user = c.get('user')!
    const { teamId } = c.req.valid('query')
    try {
        const status = await trelloOauth.getConnectionStatus(user.id, teamId)
        return c.json(status, 200)
    }
    catch (err) {
        log.e(err)
        const mapped = mapServiceError(err)
        return c.json({ error: mapped.message }, mapped.status)
    }
})

protectedRoutes.openapi(authorizeRoute, async c => {
    const user = c.get('user')!
    const { teamId, returnTeamSlug } = c.req.valid('query')
    try {
        const url = await trelloOauth.startAuthorize(user.id, teamId, returnTeamSlug)
        return c.json({ url }, 200)
    }
    catch (err) {
        log.e(err)
        const mapped = mapServiceError(err)
        return c.json({ error: mapped.message }, mapped.status)
    }
})

protectedRoutes.openapi(disconnectRoute, async c => {
    const user = c.get('user')!
    const { teamId } = c.req.valid('query')
    try {
        const result = await trelloOauth.disconnectTrello(user.id, teamId)
        return c.json(result, 200)
    }
    catch (err) {
        log.e(err)
        const mapped = mapServiceError(err)
        return c.json({ error: mapped.message }, mapped.status)
    }
})

protectedRoutes.openapi(catalogRoute, async c => {
    const user = c.get('user')!
    const { teamId } = c.req.valid('query')
    try {
        const catalog = await trelloImport.getCatalog(user.id, teamId)
        return c.json(catalog, 200)
    }
    catch (err) {
        log.e(err)
        const mapped = mapServiceError(err)
        return c.json({ error: mapped.message }, mapped.status)
    }
})

protectedRoutes.openapi(membersRoute, async c => {
    const user = c.get('user')!
    const { teamId, boardIds } = c.req.valid('query')
    try {
        const ids = boardIds
            ? boardIds.split(',').map(s => s.trim()).filter(Boolean)
            : []
        const result = await trelloMembers.listTeamMembersForBoards(user.id, teamId, ids)
        return c.json(result, 200)
    }
    catch (err) {
        log.e(err)
        const mapped = mapServiceError(err)
        return c.json({ error: mapped.message }, mapped.status)
    }
})

protectedRoutes.openapi(memberMappingsRoute, async c => {
    const user = c.get('user')!
    const body = c.req.valid('json')
    try {
        const result = await trelloMembers.saveMemberMappings(
            user.id,
            body.teamId,
            body.mappings,
        )
        return c.json(result, 200)
    }
    catch (err) {
        log.e(err)
        const mapped = mapServiceError(err)
        return c.json({ error: mapped.message }, mapped.status)
    }
})

protectedRoutes.openapi(importRoute, async c => {
    const user = c.get('user')!
    const body = c.req.valid('json')
    try {
        const { teamId, ...request } = body
        const result = await trelloImport.runImport(user.id, teamId, request)
        return c.json(result, 200)
    }
    catch (err) {
        log.e(err)
        const mapped = mapServiceError(err)
        return c.json({ error: mapped.message }, mapped.status)
    }
})

protectedRoutes.openapi(syncRoute, async c => {
    const user = c.get('user')!
    const { boardLinkId } = c.req.valid('param')
    const { syncEnabled } = c.req.valid('json')
    try {
        const result = await trelloImport.setBoardSync(user.id, boardLinkId, syncEnabled)
        return c.json(result, 200)
    }
    catch (err) {
        log.e(err)
        const mapped = mapServiceError(err)
        return c.json({ error: mapped.message }, mapped.status)
    }
})

protectedRoutes.openapi(resyncRoute, async c => {
    const user = c.get('user')!
    const { boardLinkId } = c.req.valid('param')
    try {
        const result = await trelloImport.reSyncBoard(user.id, boardLinkId)
        return c.json(result, 200)
    }
    catch (err) {
        log.e(err)
        const mapped = mapServiceError(err)
        return c.json({ error: mapped.message }, mapped.status)
    }
})

/** Public routes: OAuth callback + webhooks (no session required) */
const publicRoutes = new OpenAPIHono<ApiAppEnv>()

publicRoutes.get('/callback', async c => {
    const code = c.req.query('code')
    const state = c.req.query('state')
    const error = c.req.query('error')
    
    if (error) {
        log.e('Trello OAuth error', error)
        const { frontendOrigin } = getTrelloOAuthConfig()
        return c.redirect(`${frontendOrigin}/settings?trello=error`)
    }
    
    if (!code || !state)
        return c.json({ error: 'Missing code or state' }, 400)
    
    try {
        const { redirectUrl } = await trelloOauth.handleOAuthCallback(code, state)
        return c.redirect(redirectUrl)
    }
    catch (err) {
        log.e(err)
        try {
            const { frontendOrigin } = getTrelloOAuthConfig()
            return c.redirect(`${frontendOrigin}/settings?trello=error`)
        }
        catch {
            return c.json({ error: 'OAuth callback failed' }, 500)
        }
    }
})

// Trello HEAD-checks the callback URL when creating webhooks
publicRoutes.on(['GET', 'HEAD'], '/webhooks', c => c.body(null, 200))

publicRoutes.post('/webhooks', async c => {
    const rawBody = await c.req.text()
    const signature = c.req.header('x-trello-webhook')
    
    try {
        const { webhookCallbackUrl } = getTrelloOAuthConfig()
        if (!verifyTrelloWebhookSignature(rawBody, webhookCallbackUrl, signature)) {
            log.e('Invalid Trello webhook signature')
            return c.json({ error: 'Invalid signature' }, 401)
        }
        
        const payload = rawBody ? JSON.parse(rawBody) : {}
        await handleWebhookPayload(payload)
        return c.json({ ok: true }, 200)
    }
    catch (err) {
        log.e('Webhook handling failed', err)
        // Still 200 so Trello does not disable the webhook for transient errors
        return c.json({ ok: false }, 200)
    }
})

export { protectedRoutes as trelloProtectedRoutes, publicRoutes as trelloPublicRoutes }
export default protectedRoutes
