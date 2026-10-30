export const TRELLO_PERSONAL_WORKSPACE_ID = 'personal'

export const TRELLO_OAUTH_SCOPES = [
    'read:member:trello',
    'read:board:trello',
    'read:organization:trello',
    'offline_access',
].join(' ')

export const TRELLO_AUTHORIZE_URL = 'https://auth.atlassian.com/authorize'
export const TRELLO_TOKEN_URL = 'https://auth.atlassian.com/oauth/token'
export const TRELLO_API_BASE = 'https://api.trello.com/1'

export function getTrelloOAuthConfig() {
    const clientId = process.env.TRELLO_OAUTH_CLIENT_ID
    const clientSecret = process.env.TRELLO_OAUTH_CLIENT_SECRET
    const baseUrl = (process.env.TRELLO_WEBHOOK_BASE_URL
        || process.env.BETTER_AUTH_URL
        || '').replace(/\/$/, '')
    
    if (!clientId || !clientSecret)
        throw new Error('Trello OAuth is not configured (TRELLO_OAUTH_CLIENT_ID / TRELLO_OAUTH_CLIENT_SECRET)')
    
    if (!baseUrl)
        throw new Error('Trello callback base URL is not configured (TRELLO_WEBHOOK_BASE_URL or BETTER_AUTH_URL)')
    
    return {
        clientId,
        clientSecret,
        redirectUri: `${baseUrl}/integrations/trello/callback`,
        webhookCallbackUrl: `${baseUrl}/integrations/trello/webhooks`,
        frontendOrigin: baseUrl,
    }
}

export function isTrelloConfigured() {
    return Boolean(
        process.env.TRELLO_OAUTH_CLIENT_ID
        && process.env.TRELLO_OAUTH_CLIENT_SECRET
        && (process.env.TRELLO_WEBHOOK_BASE_URL || process.env.BETTER_AUTH_URL),
    )
}
