import { tursoTable as table, tursoTimestamp as timestamp } from '@/lib/db/shared'
import { text, integer } from 'drizzle-orm/sqlite-core'

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
})

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
    userId: text('userId')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
})

// Team Members table (for collaboration)
export const teamMembers = table('team_members', {
    userId: text('userId')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    projectId: text('projectId')
        .notNull()
        .references(() => teams.id, { onDelete: 'cascade' }),
    role: text('role').notNull().default('member'), // 'owner', 'admin', 'member'
})

// Projects table
export const projects = table('projects', {
    name: text('name').notNull(),
    userId: text('userId')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    teamId: text('teamId')
        .notNull()
        .references(() => teams.id, { onDelete: 'cascade' }),
})

// Tasks table
export const tasks = table('tasks', {
    userId: text('userId')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    projectId: text('projectId')
        .notNull()
        .references(() => projects.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    content: text('content').notNull().default(''),
    status: text('status').notNull().default('backlog'), // 'backlog', 'todo', 'in-progress', 'done'
    priority: text('priority').default('medium'), // 'low', 'medium', 'high', 'urgent'
    dueDate: text('dueDate'), // ISO date string
    assigneeId: text('assigneeId').references(() => users.id, { onDelete: 'set null' }),
    order: integer('order').notNull().default(0), // for lexicographical sorting in Kanban
})

// Type exports
export type UsersInsert = typeof users.$inferInsert

export type User = typeof users.$inferSelect
export type Session = typeof sessions.$inferSelect
export type Team = typeof teams.$inferSelect
export type TeamMember = typeof teamMembers.$inferSelect
export type Project = typeof projects.$inferSelect
export type Task = typeof tasks.$inferSelect
