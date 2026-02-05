import { NextResponse, type NextRequest } from 'next/server'
import { eq } from 'drizzle-orm'
import * as client from '@/lib/db/client'
import { tasks } from '@/lib/db/schema'
import { requireBotAuth } from '@/lib/api/botAuth'
import { deleteTask, getTask, updateTask } from '@/lib/db/actions/tasks'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db: any = client.db!

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ taskId: string }> },
) {
    try {
        const { taskId } = await params
        const auth = await requireBotAuth()
        if (auth.type === 'session')
            return NextResponse.json(await getTask(taskId))
        const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1)
        if (!task)
            return NextResponse.json({ error: 'Not found.' }, { status: 404 })
        return NextResponse.json(task)
    } catch (error) {
        console.error('bot/tasks GET failed:', error)
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ taskId: string }> },
) {
    try {
        const { taskId } = await params
        const body = await request.json()
        const auth = await requireBotAuth()
        if (auth.type === 'session') {
            const updated = await updateTask(taskId, body)
            return NextResponse.json(updated)
        }
        const [updated] = await db
            .update(tasks)
            .set({
                ...body,
                updatedAt: new Date().toISOString(),
            })
            .where(eq(tasks.id, taskId))
            .returning()
        return NextResponse.json(updated)
    } catch (error) {
        console.error('bot/tasks PUT failed:', error)
        return NextResponse.json({ error: 'Unable to update task.' }, { status: 500 })
    }
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ taskId: string }> },
) {
    try {
        const { taskId } = await params
        const auth = await requireBotAuth()
        if (auth.type === 'session') {
            await deleteTask(taskId)
            return new NextResponse(null, { status: 204 })
        }
        await db.delete(tasks).where(eq(tasks.id, taskId))
        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error('bot/tasks DELETE failed:', error)
        return NextResponse.json({ error: 'Unable to delete task.' }, { status: 500 })
    }
}
