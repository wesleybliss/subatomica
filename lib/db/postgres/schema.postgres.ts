import { postgresTable as table, postgresTimestamp as timestamp } from '@/lib/db/shared'
import { boolean, index, integer, text, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core'

// Users table (managed by BetterAuth)
export const users = table('users', {
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    emailVerified: boolean('emailVerified').notNull().default(false),
    image: text('image'),
})

// Sessions table (managed by BetterAuth)
export const sessions = table('sessions', {
    expiresAt: timestamp('expiresAt').notNull(),
    token: text('token').notNull().unique(),
    ipAddress: text('ipAddress'),
    userAgent: text('userAgent'),
    userId: uuid('userId')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
}, table => ({
    userIdIndex: index('sessions_user_id_idx').on(table.userId),
}))

// Accounts table (managed by BetterAuth)
export const accounts = table('accounts', {
    accountId: text('accountId').notNull(),
    providerId: text('providerId').notNull(),
    userId: uuid('userId')
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
    // @todo
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
    ownerId: uuid('ownerId')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
}, table => ({
    ownerNameUnique: uniqueIndex('teams_owner_name_unique').on(table.ownerId, table.name),
    ownerIdIndex: index('teams_owner_id_idx').on(table.ownerId),
}))

// Team Members table (for collaboration)
export const teamMembers = table('team_members', {
    userId: uuid('userId')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    teamId: uuid('teamId')
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
    description: text('description').notNull().default(''),
    teamId: uuid('teamId')
        .notNull()
        .references(() => teams.id, { onDelete: 'cascade' }),
    ownerId: uuid('ownerId')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    isStarred: boolean('isStarred').notNull().default(false),
}, table => ({
    teamNameUnique: uniqueIndex('projects_team_name_unique').on(table.teamId, table.name),
    teamIdIndex: index('projects_team_id_idx').on(table.teamId),
    ownerIdIndex: index('projects_owner_id_idx').on(table.ownerId),
}))

// Task Lanes table
export const taskLanes = table('task_lanes', {
    projectId: uuid('projectId')
        .notNull()
        .references(() => projects.id, { onDelete: 'cascade' }),
    key: text('key').notNull(),
    name: text('name').notNull(),
    color: text('color'),
    order: integer('order').notNull().default(0),
    isDefault: boolean('isDefault').notNull().default(false),
}, table => ({
    projectIdIndex: index('task_lanes_project_id_idx').on(table.projectId),
    projectKeyUnique: uniqueIndex('task_lanes_project_key_unique').on(table.projectId, table.key),
}))

// Tasks table
export const tasks = table('tasks', {
    projectId: uuid('projectId')
        .notNull()
        .references(() => projects.id, { onDelete: 'cascade' }),
    userId: uuid('userId')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description').notNull().default(''),
    status: text('status').notNull().default('backlog'), // 'backlog', 'todo', 'in-progress', 'done'
    priority: text('priority').default('medium'), // 'low', 'medium', 'high', 'urgent'
    dueDate: timestamp('dueDate'),
    assigneeId: uuid('assigneeId').references(() => users.id, { onDelete: 'set null' }),
    order: integer('order').notNull().default(0), // for lexicographical sorting in Kanban
    isStarred: boolean('isStarred').notNull().default(false),
}, table => ({
    projectIdIndex: index('tasks_project_id_idx').on(table.projectId),
    userIdIndex: index('tasks_user_id_idx').on(table.userId),
    assigneeIdIndex: index('tasks_assignee_id_idx').on(table.assigneeId),
    statusIndex: index('tasks_status_idx').on(table.status),
}))

// Comments table
export const comments = table('comments', {
    taskId: uuid('taskId')
        .notNull()
        .references(() => tasks.id, { onDelete: 'cascade' }),
    userId: uuid('userId')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    content: text('content').notNull().default(''),
}, table => ({
    taskIdIndex: index('comments_task_id_idx').on(table.taskId),
    userIdIndex: index('comments_user_id_idx').on(table.userId),
}))

// Type exports
export type UsersInsert = typeof users.$inferInsert

export type User = typeof users.$inferSelect
export type Session = typeof sessions.$inferSelect
export type Workspace = typeof teams.$inferSelect
export type WorkspaceMember = typeof teamMembers.$inferSelect
export type Project = typeof projects.$inferSelect
export type TaskLane = typeof taskLanes.$inferSelect
export type Task = typeof tasks.$inferSelect
export type Comment = typeof comments.$inferSelect
