import { index, integer, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

import { tursoTable as table, tursoTimestamp as timestamp } from '../shared'

// Users table (managed by BetterAuth)
export const users = table('users', {
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: integer('emailVerified', { mode: 'boolean' }).notNull().default(false),
    image: text('image'),
})

// Sessions table (managed by BetterAuth)
export const sessions = table('sessions', {
    expiresAt: timestamp('expiresAt').notNull(),
    token: text('token').notNull().unique(),
    ipAddress: text('ipAddress'),
    userAgent: text('userAgent'),
    userId: text('userId')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
}, table => ({
    userIdIndex: index('sessions_user_id_idx').on(table.userId),
}))

// Accounts table (managed by BetterAuth)
export const accounts = table('accounts', {
    accountId: text('accountId').notNull(),
    providerId: text('providerId').notNull(),
    userId: text('userId')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    accessToken: text('accessToken'),
    refreshToken: text('refreshToken'),
    idToken: text('idToken'),
    accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
    refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
    scope: text('scope'),
    password: text('password'),
    
    // Non-auth fields
    // TODO
}, table => ({
    providerAccountUnique: uniqueIndex('accounts_provider_account_unique').on(table.providerId, table.accountId),
    userProviderUnique: uniqueIndex('accounts_user_provider_unique').on(table.userId, table.providerId),
}))

// Verifications table (managed by BetterAuth)
export const verifications = table('verifications', {
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expiresAt').notNull(),
}, table => ({
    identifierValueUnique: uniqueIndex('verifications_identifier_value_unique').on(table.identifier, table.value),
}))

// Teams table
export const teams = table('teams', {
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    ownerId: text('ownerId')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
}, table => ({
    ownerNameUnique: uniqueIndex('teams_owner_name_unique').on(table.ownerId, table.name),
    ownerSlugUnique: uniqueIndex('teams_owner_slug_unique').on(table.ownerId, table.slug),
    ownerIdIndex: index('teams_owner_id_idx').on(table.ownerId),
}))

// Team Members table (for collaboration)
export const teamMembers = table('teamMembers', {
    userId: text('userId')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    teamId: text('teamId')
        .notNull()
        .references(() => teams.id, { onDelete: 'cascade' }),
    role: text('role').notNull().default('member'), // 'owner', 'admin', 'member'
}, table => ({
    teamUserUnique: uniqueIndex('team_members_team_user_unique').on(table.teamId, table.userId),
    teamIdIndex: index('team_members_team_id_idx').on(table.teamId),
    userIdIndex: index('team_members_user_id_idx').on(table.userId),
}))

// Projects table
export const projects = table('projects', {
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    taskSequence: integer('taskSequence').notNull().default(1),
    description: text('description').notNull().default(''),
    ownerId: text('ownerId')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    teamId: text('teamId')
        .notNull()
        .references(() => teams.id, { onDelete: 'cascade' }),
    isStarred: integer('isStarred', { mode: 'boolean' }).notNull().default(false),
}, table => ({
    teamNameUnique: uniqueIndex('projects_team_name_unique').on(table.teamId, table.name),
    teamSlugUnique: uniqueIndex('projects_team_slug_unique').on(table.teamId, table.slug),
    teamIdIndex: index('projects_team_id_idx').on(table.teamId),
    ownerIdIndex: index('projects_owner_id_idx').on(table.ownerId),
}))

// Task Lanes table
export const taskLanes = table('taskLanes', {
    projectId: text('projectId')
        .notNull()
        .references(() => projects.id, { onDelete: 'cascade' }),
    key: text('key').notNull(),
    name: text('name').notNull(),
    color: text('color'),
    order: integer('order').notNull().default(0),
    isDefault: integer('isDefault', { mode: 'boolean' }).notNull().default(false),
}, table => ({
    projectIdIndex: index('task_lanes_project_id_idx').on(table.projectId),
    projectKeyUnique: uniqueIndex('task_lanes_project_key_unique').on(table.projectId, table.key),
}))

// Tasks table
export const tasks = table('tasks', {
    userId: text('userId')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    projectId: text('projectId')
        .notNull()
        .references(() => projects.id, { onDelete: 'cascade' }),
    localId: integer('localId').notNull(),
    title: text('title').notNull(),
    description: text('description').notNull().default(''),
    status: text('status').notNull().default('backlog'), // 'backlog', 'todo', 'in-progress', 'done'
    priority: text('priority').default('medium'), // 'low', 'medium', 'high', 'urgent'
    dueDate: timestamp('dueDate'),
    assigneeId: text('assigneeId').references(() => users.id, { onDelete: 'set null' }),
    order: integer('order').notNull().default(0), // for lexicographical sorting in Kanban
    isStarred: integer('isStarred', { mode: 'boolean' }).notNull().default(false),
}, table => ({
    projectIdIndex: index('tasks_project_id_idx').on(table.projectId),
    projectLocalIdUnique: uniqueIndex('tasks_project_local_id_unique').on(table.projectId, table.localId),
    userIdIndex: index('tasks_user_id_idx').on(table.userId),
    assigneeIdIndex: index('tasks_assignee_id_idx').on(table.assigneeId),
    statusIndex: index('tasks_status_idx').on(table.status),
}))

// Comments table
export const comments = table('comments', {
    taskId: text('taskId')
        .notNull()
        .references(() => tasks.id, { onDelete: 'cascade' }),
    userId: text('userId')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    content: text('content').notNull().default(''),
}, table => ({
    taskIdIndex: index('comments_task_id_idx').on(table.taskId),
    userIdIndex: index('comments_user_id_idx').on(table.userId),
}))

// Trello OAuth connection (one per user)
export const trelloConnections = table('trelloConnections', {
    userId: text('userId')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    trelloMemberId: text('trelloMemberId').notNull(),
    trelloUsername: text('trelloUsername'),
    accessToken: text('accessToken').notNull(),
    refreshToken: text('refreshToken').notNull(),
    accessTokenExpiresAt: timestamp('accessTokenExpiresAt').notNull(),
    scope: text('scope'),
}, table => ({
    userIdUnique: uniqueIndex('trello_connections_user_id_unique').on(table.userId),
    memberIdIndex: index('trello_connections_member_id_idx').on(table.trelloMemberId),
}))

// Short-lived PKCE state for OAuth authorize → callback
export const trelloOauthStates = table('trelloOauthStates', {
    userId: text('userId')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    codeVerifier: text('codeVerifier').notNull(),
    returnTeamId: text('returnTeamId'),
    expiresAt: timestamp('expiresAt').notNull(),
}, table => ({
    userIdIndex: index('trello_oauth_states_user_id_idx').on(table.userId),
}))

// Trello workspace (org) ↔ team. Use trelloWorkspaceId = 'personal' for boards with no org.
export const trelloWorkspaceLinks = table('trelloWorkspaceLinks', {
    userId: text('userId')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    trelloWorkspaceId: text('trelloWorkspaceId').notNull(),
    trelloWorkspaceName: text('trelloWorkspaceName').notNull(),
    teamId: text('teamId')
        .notNull()
        .references(() => teams.id, { onDelete: 'cascade' }),
}, table => ({
    workspaceUnique: uniqueIndex('trello_workspace_links_workspace_unique').on(table.userId, table.trelloWorkspaceId),
    teamIdIndex: index('trello_workspace_links_team_id_idx').on(table.teamId),
}))

// Trello board ↔ project
export const trelloBoardLinks = table('trelloBoardLinks', {
    userId: text('userId')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    trelloBoardId: text('trelloBoardId').notNull(),
    trelloBoardName: text('trelloBoardName').notNull(),
    trelloWorkspaceId: text('trelloWorkspaceId').notNull(),
    projectId: text('projectId')
        .notNull()
        .references(() => projects.id, { onDelete: 'cascade' }),
    teamId: text('teamId')
        .notNull()
        .references(() => teams.id, { onDelete: 'cascade' }),
    webhookId: text('webhookId'),
    syncEnabled: integer('syncEnabled', { mode: 'boolean' }).notNull().default(false),
    lastSyncedAt: timestamp('lastSyncedAt'),
}, table => ({
    boardUnique: uniqueIndex('trello_board_links_board_unique').on(table.trelloBoardId),
    projectUnique: uniqueIndex('trello_board_links_project_unique').on(table.projectId),
    teamIdIndex: index('trello_board_links_team_id_idx').on(table.teamId),
    userIdIndex: index('trello_board_links_user_id_idx').on(table.userId),
}))

// Trello list ↔ lane
export const trelloListLinks = table('trelloListLinks', {
    trelloListId: text('trelloListId').notNull(),
    laneId: text('laneId')
        .notNull()
        .references(() => taskLanes.id, { onDelete: 'cascade' }),
    boardLinkId: text('boardLinkId')
        .notNull()
        .references(() => trelloBoardLinks.id, { onDelete: 'cascade' }),
}, table => ({
    listUnique: uniqueIndex('trello_list_links_list_unique').on(table.trelloListId),
    laneUnique: uniqueIndex('trello_list_links_lane_unique').on(table.laneId),
    boardLinkIdIndex: index('trello_list_links_board_link_id_idx').on(table.boardLinkId),
}))

// Trello card ↔ task
export const trelloCardLinks = table('trelloCardLinks', {
    trelloCardId: text('trelloCardId').notNull(),
    taskId: text('taskId')
        .notNull()
        .references(() => tasks.id, { onDelete: 'cascade' }),
    boardLinkId: text('boardLinkId')
        .notNull()
        .references(() => trelloBoardLinks.id, { onDelete: 'cascade' }),
}, table => ({
    cardUnique: uniqueIndex('trello_card_links_card_unique').on(table.trelloCardId),
    taskUnique: uniqueIndex('trello_card_links_task_unique').on(table.taskId),
    boardLinkIdIndex: index('trello_card_links_board_link_id_idx').on(table.boardLinkId),
}))

// Type exports
export type UsersInsert = typeof users.$inferInsert

export type User = typeof users.$inferSelect
export type Session = typeof sessions.$inferSelect
export type Team = typeof teams.$inferSelect
export type TeamMember = typeof teamMembers.$inferSelect
export type Project = typeof projects.$inferSelect
export type TaskLane = typeof taskLanes.$inferSelect
export type Task = typeof tasks.$inferSelect
export type Comment = typeof comments.$inferSelect
export type TrelloConnection = typeof trelloConnections.$inferSelect
export type TrelloWorkspaceLink = typeof trelloWorkspaceLinks.$inferSelect
export type TrelloBoardLink = typeof trelloBoardLinks.$inferSelect
export type TrelloListLink = typeof trelloListLinks.$inferSelect
export type TrelloCardLink = typeof trelloCardLinks.$inferSelect
