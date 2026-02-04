import { postgresTable as table, postgresTimestamp as timestamp } from '@/lib/db/shared'
import { boolean, integer, text, uuid, varchar } from 'drizzle-orm/pg-core'

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
})

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
})

// Verifications table (managed by BetterAuth)
export const verifications = table('verifications', {
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expiresAt').notNull(),
})

// Teams table
export const teams = table('teams', {
    name: text('name').notNull(),
    userId: uuid('userId')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
})

// Team Members table (for collaboration)
export const teamMembers = table('team_members', {
    userId: uuid('userId')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    teamId: uuid('teamId')
        .notNull()
        .references(() => teams.id, { onDelete: 'cascade' }),
    role: text('role').notNull().default('member'), // 'owner', 'admin', 'member'
})

// Projects table
export const projects = table('projects', {
    name: text('name').notNull(),
    teamId: uuid('teamId')
        .notNull()
        .references(() => teams.id, { onDelete: 'cascade' }),
    userId: uuid('userId')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    parentId: uuid('parentId'), // Self-reference for nesting
})

// Tasks table
export const tasks = table('tasks', {
    projectId: uuid('projectId')
        .notNull()
        .references(() => projects.id, { onDelete: 'cascade' }),
    userId: uuid('userId')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    content: text('content').notNull().default(''),
    status: text('status').notNull().default('backlog'), // 'backlog', 'todo', 'in-progress', 'done'
    priority: text('priority').default('medium'), // 'low', 'medium', 'high', 'urgent'
    dueDate: text('dueDate'), // ISO date string
    assigneeId: uuid('assigneeId').references(() => users.id, { onDelete: 'set null' }),
    order: integer('order').notNull().default(0), // for lexicographical sorting in Kanban
    isStarred: boolean('isStarred').notNull().default(false),
})

// Type exports
export type UsersInsert = typeof users.$inferInsert

export type User = typeof users.$inferSelect
export type Session = typeof sessions.$inferSelect
export type Workspace = typeof teams.$inferSelect
export type WorkspaceMember = typeof teamMembers.$inferSelect
export type Project = typeof projects.$inferSelect
export type Task = typeof tasks.$inferSelect
