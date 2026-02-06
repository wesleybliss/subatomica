import * as tursoSchema from '@/db/turso/schema.turso'
import * as postgresSchema from '@/db/postgres/schema.postgres'

if (!process.env.DATABASE_DIALECT)
    throw new Error('schema.ts: DATABASE_DIALECT env variable is not set')

export type Schema = typeof tursoSchema | typeof postgresSchema

export const schema = process.env.DATABASE_DIALECT === 'turso'
    ? tursoSchema
    : postgresSchema

// Type-level conditional using declaration merging
export type ActiveSchema = typeof process.env.DATABASE_DIALECT extends 'turso'
    ? typeof tursoSchema
    : typeof postgresSchema

export default schema

export const users = schema.users
export const sessions = schema.sessions
export const accounts = schema.accounts
export const verifications = schema.verifications
export const teams = schema.teams
export const teamMembers = schema.teamMembers
export const projects = schema.projects
export const taskLanes = schema.taskLanes
export const tasks = schema.tasks
export const comments = schema.comments

export type UsersInsert = ActiveSchema['users']['$inferInsert']

export type User = ActiveSchema['users']['$inferSelect']
export type Session = ActiveSchema['sessions']['$inferSelect']
export type Team = ActiveSchema['teams']['$inferSelect']
export type TeamMember = ActiveSchema['teamMembers']['$inferSelect']
export type Project = ActiveSchema['projects']['$inferSelect']
export type TaskLane = ActiveSchema['taskLanes']['$inferSelect']
export type Task = ActiveSchema['tasks']['$inferSelect']
export type Comment = ActiveSchema['comments']['$inferSelect']
