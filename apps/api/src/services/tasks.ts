import * as client from '@/db/client'
import { and, eq, inArray, or } from 'drizzle-orm'
import { projects, teamMembers, teams } from '@/db/schema'
import { Task } from '@repo/shared/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db: any = client.db!

export async function createTask(userId: string, teamId: string, name: string): Promise<Task> {



}

export async function deleteTask(userId: string, projectId: string): Promise<void> {



}

export async function renameTask(userId: string, projectId: string, name: string): Promise<void> {



}

export async function getTasks(userId: string, teamId?: string): Promise<Task[]> {



}

export async function getTaskById(userId: string, teamId: string, projectId: string): Promise<Task> {



}
