import { NextResponse, type NextRequest } from 'next/server'
import { and, desc, eq } from 'drizzle-orm'
import * as client from '@/lib/db/client'
import { projects, tasks } from '@/lib/db/schema'
import { requireBotAuth } from '@/lib/api/botAuth'
import { createTask, getTasks } from '@/lib/db/actions/tasks'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db: any = client.db!

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId') || undefined
    const teamId = searchParams.get('teamId') || undefined
    try {
        const auth = await requireBotAuth()
        if (auth.type === 'session')
            return NextResponse.json(await getTasks(projectId, teamId))
        if (teamId) {
            const result = await db
                .select({ task: tasks })
                .from(tasks)
                .innerJoin(projects, eq(tasks.projectId, projects.id))
                .where(eq(projects.teamId, teamId))
                .orderBy(tasks.order)
            return NextResponse.json(result.map((row: { task: typeof tasks.$inferSelect }) => row.task))
        }
        const result = projectId
            ? await db.select().from(tasks).where(eq(tasks.projectId, projectId)).orderBy(tasks.order)
            : await db.select().from(tasks).orderBy(tasks.order)
        return NextResponse.json(result)
    } catch (error) {
        console.error('[v0] bot/tasks GET failed:', error)
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const auth = await requireBotAuth()
        if (auth.type === 'session') {
            const task = await createTask({
                title: body.title,
                description: body.description,
                projectId: body.projectId,
                status: body.status,
                priority: body.priority,
                dueDate: body.dueDate,
                assigneeId: body.assigneeId,
            })
            return NextResponse.json(task, { status: 201 })
        }
        if (!body.userId)
            return NextResponse.json({ error: 'userId is required for API key requests.' }, { status: 400 })
        const status = body.status || 'backlog'
        const maxOrderTask = await db
            .select()
            .from(tasks)
            .where(and(
                eq(tasks.projectId, body.projectId),
                eq(tasks.status, status),
            ))
            .orderBy(desc(tasks.order))
            .limit(1)
        const order = maxOrderTask.length > 0 ? maxOrderTask[0].order + 1000 : 1000
        const [task] = await db
            .insert(tasks)
            .values({
                projectId: body.projectId,
                userId: body.userId,
                title: body.title,
                description: body.description || '',
                status,
                priority: body.priority,
                dueDate: body.dueDate,
                assigneeId: body.assigneeId,
                order,
            })
            .returning()
        return NextResponse.json(task, { status: 201 })
    } catch (error) {
        console.error('[v0] bot/tasks POST failed:', error)
        return NextResponse.json({ error: 'Unable to create task.' }, { status: 500 })
    }
}
