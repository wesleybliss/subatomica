# Plan: Trello Import + Sync

## Goal

Import from Trello in team settings: OAuth connect, map workspaces→teams and boards→projects, one-shot import, optional Trello→Subatomica webhooks.

## Mapping

| Trello | Subatomica |
|--------|------------|
| Workspace (org) | Team (create new or link existing) |
| Personal boards (no org) | Chosen team (create or link) |
| Board | Project (create new or link existing; one board ↔ one project) |
| List | Lane (name-match; create missing) |
| Card | Task (upsert by Trello card id) |

Skip in v1: bidirectional sync, checklists, attachments, comments, assignees (append Trello URL in description).

## Sync

- One-shot REST import.
- Optional board webhooks for near-real-time Trello→Subatomica updates.
- No native Trello “periodic sync”; polling is backup-only (not v1).

## Auth

Trello OAuth 2.0 confidential client + PKCE.

Scopes: `read:member:trello`, `read:board:trello`, `read:organization:trello`, `offline_access`.

Env: `TRELLO_OAUTH_CLIENT_ID`, `TRELLO_OAUTH_CLIENT_SECRET`, webhook base URL (or `BETTER_AUTH_URL`).

## Persistence

- `trelloConnections` — **per-team** OAuth tokens + Trello member id (`teamId` unique; `connectedByUserId` audit)
- `trelloOauthStates` — short-lived PKCE state (includes `teamId`)
- `trelloWorkspaceLinks` — workspace ↔ team (unique on team + workspace)
- `trelloBoardLinks` — board ↔ project, webhook id, sync flag
- `trelloListLinks` — list ↔ lane
- `trelloCardLinks` — card ↔ task

## Wizard UX (team settings → Integrations)

1. Connect / Disconnect Trello for **this team** (owners/admins); members can import/sync
2. List workspaces on the linked Trello account
3. Per board: create project or link existing; Keep in sync toggle
4. Run import; show status / re-sync for already-linked boards

## API surface

- `GET /integrations/trello/status?teamId=`
- `GET /integrations/trello/authorize?teamId=&returnTeamSlug=`
- `GET /integrations/trello/callback` (public)
- `DELETE /integrations/trello/connection?teamId=`
- `GET /integrations/trello/catalog?teamId=` (workspaces + boards + existing links)
- `POST /integrations/trello/import` (body includes `teamId`)
- `POST /integrations/trello/boards/:linkId/sync` (toggle / re-sync)
- `GET|HEAD|POST /integrations/trello/webhooks` (public)

## Phases

1. Schema + exports
2. OAuth connect/disconnect + Trello API client (refresh)
3. Catalog + import service (workspace/team + board/project + lanes/tasks)
4. Webhooks + sync toggle
5. Team settings UI
6. `pnpm lint` + `pnpm check`

## Ops notes

- Webhook callback must be public HTTPS; Trello HEAD-checks on create.
- Verify `X-Trello-Webhook` HMAC with client secret.
- Rate-limit awareness; prefer webhooks over polling.

## Personal notes

### What we deliberately skip in v1

- Bidirectional sync (Subatomica → Trello)
- Checklists, attachments, comments, members/assignees (can append Trello URL in description)
- Manual per-list remapping UI (name-match + create-missing is enough)
